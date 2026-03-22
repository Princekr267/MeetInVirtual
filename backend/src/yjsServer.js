/**
 * Yjs WebSocket Server for Collaborative Notepad (Manual Implementation)
 */

import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';

const PORT = process.env.YJS_PORT || 1234;
const docs = new Map();
const conns = new Map(); // Track connections per room
const wss = new WebSocketServer({ port: PORT });

const getYDoc = (roomName) => {
    if (!docs.has(roomName)) {
        const doc = new Y.Doc();
        docs.set(roomName, doc);
        conns.set(roomName, new Set());

        // Broadcast updates to all clients in the room
        doc.on('update', (update) => {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, 0);
            syncProtocol.writeUpdate(encoder, update);
            const message = encoding.toUint8Array(encoder);

            conns.get(roomName)?.forEach((conn) => {
                if (conn.readyState === 1) { // WebSocket.OPEN
                    conn.send(message);
                }
            });
        });
    }
    return docs.get(roomName);
};

wss.on('connection', (ws, req) => {
    const roomName = req.url?.slice(1) || 'default';
    const doc = getYDoc(roomName);

    // Add connection to room
    conns.get(roomName).add(ws);

    console.log(`[Yjs] Client connected to room: ${roomName}`);

    // Send sync step 1
    const encoderSync = encoding.createEncoder();
    encoding.writeVarUint(encoderSync, 0);
    syncProtocol.writeSyncStep1(encoderSync, doc);
    ws.send(encoding.toUint8Array(encoderSync));

    const messageHandler = (message) => {
        try {
            const decoder = decoding.createDecoder(new Uint8Array(message));
            const encoder = encoding.createEncoder();
            const messageType = decoding.readVarUint(decoder);

            switch (messageType) {
                case 0: // Sync
                    encoding.writeVarUint(encoder, 0);
                    syncProtocol.readSyncMessage(decoder, encoder, doc, ws);
                    if (encoding.length(encoder) > 1) {
                        ws.send(encoding.toUint8Array(encoder));
                    }
                    break;
                case 1: // Awareness
                    awarenessProtocol.applyAwarenessUpdate(
                        doc.awareness || new awarenessProtocol.Awareness(doc),
                        decoding.readVarUint8Array(decoder),
                        ws
                    );
                    break;
            }
        } catch (err) {
            console.error(`[Yjs] Message handling error in room ${roomName}:`, err.message);
        }
    };

    ws.on('message', messageHandler);

    ws.on('close', () => {
        conns.get(roomName)?.delete(ws);
        console.log(`[Yjs] Client disconnected from room: ${roomName}`);
    });

    ws.on('error', (error) => {
        console.error(`[Yjs] WebSocket error in room ${roomName}:`, error.message);
    });
});

wss.on('error', (error) => {
    console.error('[Yjs] Server error:', error.message);
});

console.log(`[Yjs] WebSocket server running on port ${PORT}`);
console.log(`[Yjs] Rooms are isolated by URL path (e.g., ws://localhost:${PORT}/room123)`);

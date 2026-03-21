/**
 * Yjs WebSocket Server for Collaborative Notepad
 *
 * This server handles real-time collaborative editing using Yjs.
 * Each room has its own isolated Y.Doc, namespaced by roomId.
 *
 * Port: 1234 (configurable via YJS_PORT env variable)
 */

import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils';

const PORT = process.env.YJS_PORT || 1234;

const wss = new WebSocketServer({ port: PORT });

// Store for room documents (auto-managed by y-websocket)
const docs = new Map();

wss.on('connection', (ws, req) => {
    // Extract room name from URL path (e.g., /room123)
    const roomName = req.url?.slice(1) || 'default';

    console.log(`[Yjs] Client connected to room: ${roomName}`);

    // Setup Yjs WebSocket connection
    // y-websocket handles document sync, awareness (cursors), and persistence
    setupWSConnection(ws, req, {
        docName: roomName,
        gc: true // Enable garbage collection for deleted content
    });

    ws.on('close', () => {
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

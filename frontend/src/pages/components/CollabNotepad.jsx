/**
 * CollabNotepad - Collaborative Real-time Notepad Component
 *
 * Features:
 * - Rich text editing with Quill (bold, italic, strike, headings, lists, code blocks)
 * - Real-time sync via Yjs + y-websocket
 * - Multi-user cursors with names and unique colors
 * - Undo/Redo managed by Yjs (not browser)
 * - Download notes as .txt
 * - Connection status indicator
 * - Auto-cleanup on unmount
 *
 * Props:
 * - roomId: string - unique room identifier for document isolation
 * - userName: string - display name for cursor
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';
import TitleIcon from '@mui/icons-material/Title';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import 'quill/dist/quill.snow.css';
import '../../styles/notepad.css';

// Register Quill cursors module
Quill.register('modules/cursors', QuillCursors);

// Generate a consistent color based on user name
const getUserColor = (name) => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FF7F50'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// Get Yjs WebSocket server URL based on environment
const getYjsServerUrl = () => {
    const prodUrl = import.meta.env.VITE_YJS_SERVER_URL;
    if (prodUrl) {
        return prodUrl.startsWith('wss://') || prodUrl.startsWith('ws://')
            ? prodUrl
            : `wss://${prodUrl}`;
    }
    return 'ws://localhost:1234';
};

const CollabNotepad = ({ roomId, userName, onClose }) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const yDocRef = useRef(null);
    const providerRef = useRef(null);
    const undoManagerRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [copied, setCopied] = useState(false);

    // Sanitize roomId for use as Yjs document name
    const sanitizedRoomId = roomId.replace(/[^a-zA-Z0-9-_]/g, '_');

    // Initialize Yjs and Quill
    useEffect(() => {
        if (!editorRef.current || quillRef.current) return;

        // Create Y.Doc for this room
        const ydoc = new Y.Doc();
        yDocRef.current = ydoc;

        // Create WebSocket provider with room namespace
        const wsUrl = getYjsServerUrl();
        const provider = new WebsocketProvider(wsUrl, sanitizedRoomId, ydoc);
        providerRef.current = provider;

        // Connection status tracking
        provider.on('status', ({ status }) => {
            setIsConnected(status === 'connected');
        });

        // Initialize Quill editor
        const quill = new Quill(editorRef.current, {
            theme: 'snow',
            modules: {
                cursors: true,
                toolbar: {
                    container: '#notepad-toolbar'
                },
                history: {
                    userOnly: true
                }
            },
            placeholder: 'Start taking notes together...'
        });
        quillRef.current = quill;

        // Get Y.Text for document content
        const ytext = ydoc.getText('quill');

        // Setup Yjs UndoManager
        const undoManager = new Y.UndoManager(ytext);
        undoManagerRef.current = undoManager;

        // Bind Quill to Y.Text for real-time sync
        let isUpdatingFromYjs = false;

        // Sync initial content from Yjs to Quill
        const initialContent = ytext.toDelta();
        if (initialContent.length > 0) {
            quill.setContents(initialContent, 'silent');
        }

        // Listen for remote changes from Yjs
        ytext.observe((event) => {
            if (event.transaction.local) return;

            isUpdatingFromYjs = true;
            const delta = event.delta;

            let index = 0;
            delta.forEach(op => {
                if (op.retain !== undefined) {
                    index += op.retain;
                } else if (op.insert !== undefined) {
                    quill.insertText(index, op.insert, op.attributes || {}, 'silent');
                    index += typeof op.insert === 'string' ? op.insert.length : 1;
                } else if (op.delete !== undefined) {
                    quill.deleteText(index, op.delete, 'silent');
                }
            });

            isUpdatingFromYjs = false;
        });

        // Listen for local changes from Quill
        quill.on('text-change', (delta, oldDelta, source) => {
            if (source !== 'user' || isUpdatingFromYjs) return;

            ydoc.transact(() => {
                let index = 0;
                delta.ops.forEach(op => {
                    if (op.retain !== undefined) {
                        if (op.attributes) {
                            ytext.format(index, op.retain, op.attributes);
                        }
                        index += op.retain;
                    } else if (op.insert !== undefined) {
                        const text = typeof op.insert === 'string' ? op.insert : '\n';
                        ytext.insert(index, text, op.attributes || {});
                        index += text.length;
                    } else if (op.delete !== undefined) {
                        ytext.delete(index, op.delete);
                    }
                });
            });
        });

        // Setup awareness for multi-user cursors
        const awareness = provider.awareness;
        const cursors = quill.getModule('cursors');

        // Set local user info
        const userColor = getUserColor(userName);
        awareness.setLocalStateField('user', {
            name: userName,
            color: userColor
        });

        // Track cursor position
        quill.on('selection-change', (range) => {
            if (range) {
                awareness.setLocalStateField('cursor', {
                    index: range.index,
                    length: range.length
                });
            }
        });

        // Render remote cursors and track active users
        awareness.on('change', () => {
            const states = awareness.getStates();
            const users = [];

            cursors.clearCursors();

            states.forEach((state, clientId) => {
                if (state.user) {
                    users.push({ ...state.user, clientId });
                }

                if (clientId === awareness.clientID) return;

                const user = state.user;
                const cursor = state.cursor;

                if (user && cursor) {
                    try {
                        cursors.createCursor(
                            clientId.toString(),
                            user.name,
                            user.color
                        );
                        cursors.moveCursor(clientId.toString(), cursor);
                    } catch (e) {
                        // Cursor position may be invalid
                    }
                }
            });

            setActiveUsers(users);
        });

        // Keyboard shortcuts for undo/redo
        const handleKeydown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    undoManagerRef.current?.redo();
                } else {
                    undoManagerRef.current?.undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                undoManagerRef.current?.redo();
            }
        };

        editorRef.current.addEventListener('keydown', handleKeydown);

        // Cleanup function
        return () => {
            editorRef.current?.removeEventListener('keydown', handleKeydown);

            if (providerRef.current) {
                providerRef.current.disconnect();
                providerRef.current.destroy();
                providerRef.current = null;
            }

            if (yDocRef.current) {
                yDocRef.current.destroy();
                yDocRef.current = null;
            }

            if (quillRef.current) {
                quillRef.current = null;
            }

            if (undoManagerRef.current) {
                undoManagerRef.current.destroy();
                undoManagerRef.current = null;
            }
        };
    }, [sanitizedRoomId, userName]);

    // Handle undo
    const handleUndo = useCallback(() => {
        undoManagerRef.current?.undo();
    }, []);

    // Handle redo
    const handleRedo = useCallback(() => {
        undoManagerRef.current?.redo();
    }, []);

    // Download notes as .txt
    const handleDownload = useCallback(() => {
        const quill = quillRef.current;
        if (!quill) return;

        const text = quill.getText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-notes-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    // Share room link
    const handleShare = useCallback(async () => {
        const shareUrl = window.location.href;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, []);

    // Toolbar button handlers
    const formatText = (format, value = true) => {
        const quill = quillRef.current;
        if (!quill) return;

        const selection = quill.getSelection();
        if (selection) {
            if (format === 'header') {
                quill.format('header', value);
            } else {
                const currentFormat = quill.getFormat();
                quill.format(format, !currentFormat[format]);
            }
        }
    };

    return (
        <div className="notepad-panel">
            {/* Header */}
            <div className="notepad-header">
                <div className="notepad-header-left">
                    <EditNoteIcon className="notepad-title-icon" />
                    <h2>Collaborative Notes</h2>
                </div>
                <div className="notepad-header-right">
                    {isConnected && (
                        <Tooltip title="Real-time sync active">
                            <div className="notepad-status connected">
                                <CircleIcon />
                                <span>Live</span>
                            </div>
                        </Tooltip>
                    )}
                    
                    <Tooltip title="Download notes">
                        <IconButton onClick={handleDownload} size="small" className="notepad-header-btn">
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                    {onClose && (
                        <Tooltip title="Close notepad">
                            <IconButton onClick={onClose} size="small" className="notepad-header-btn notepad-close-btn">
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Active Users */}
            {activeUsers.length > 0 && (
                <div className="notepad-users">
                    {activeUsers.slice(0, 5).map((user, idx) => (
                        <Tooltip key={user.clientId || idx} title={user.name}>
                            <div
                                className="notepad-user-avatar"
                                style={{ backgroundColor: user.color }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </Tooltip>
                    ))}
                    {activeUsers.length > 5 && (
                        <div className="notepad-user-count">+{activeUsers.length - 5}</div>
                    )}
                </div>
            )}

            {/* Custom Toolbar */}
            <div id="notepad-toolbar" className="notepad-toolbar">
                <div className="notepad-toolbar-group">
                    <Tooltip title="Bold (Ctrl+B)">
                        <button className="ql-bold"><FormatBoldIcon /></button>
                    </Tooltip>
                    <Tooltip title="Italic (Ctrl+I)">
                        <button className="ql-italic"><FormatItalicIcon /></button>
                    </Tooltip>
                    <Tooltip title="Strikethrough">
                        <button className="ql-strike"><FormatStrikethroughIcon /></button>
                    </Tooltip>
                </div>
                <div className="notepad-toolbar-divider" />
                <div className="notepad-toolbar-group">
                    <Tooltip title="Heading 1">
                        <button className="ql-header" value="1"><TitleIcon style={{ fontSize: '1.3rem' }} /></button>
                    </Tooltip>
                    <Tooltip title="Heading 2">
                        <button className="ql-header" value="2"><TitleIcon style={{ fontSize: '1rem' }} /></button>
                    </Tooltip>
                </div>
                <div className="notepad-toolbar-divider" />
                <div className="notepad-toolbar-group">
                    <Tooltip title="Bullet List">
                        <button className="ql-list" value="bullet"><FormatListBulletedIcon /></button>
                    </Tooltip>
                    <Tooltip title="Numbered List">
                        <button className="ql-list" value="ordered"><FormatListNumberedIcon /></button>
                    </Tooltip>
                </div>
                <div className="notepad-toolbar-divider" />
                <div className="notepad-toolbar-group">
                    <Tooltip title="Code Block">
                        <button className="ql-code-block"><CodeIcon /></button>
                    </Tooltip>
                    <Tooltip title="Clear Formatting">
                        <button className="ql-clean"><FormatClearIcon /></button>
                    </Tooltip>
                </div>
                <div className="notepad-toolbar-spacer" />
                <div className="notepad-toolbar-group notepad-history-btns">
                    <Tooltip title="Undo (Ctrl+Z)">
                        <IconButton onClick={handleUndo} size="small">
                            <UndoIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Redo (Ctrl+Y)">
                        <IconButton onClick={handleRedo} size="small">
                            <RedoIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Editor */}
            <div className="notepad-editor-container">
                <div ref={editorRef} className="notepad-editor"></div>
            </div>
        </div>
    );
};

export default CollabNotepad;

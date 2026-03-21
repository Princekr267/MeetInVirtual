import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/videoComponent.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import io from 'socket.io-client';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import Badge from '@mui/material/Badge';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import StarIcon from '@mui/icons-material/Star';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleGenAI } from "@google/genai";
import { AuthContext } from '../context/AuthContext';
import CollabNotepad from './components/CollabNotepad';


const SERVER_URL = "http://localhost:3000";
const AI_SENDER  = "🤖 AI Assistant";

// Module-level WebRTC peer connections map
const connections = {};

const peerConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// ─────────────────────────────────────────────────────────────────────────────
// VideoTile — a single remote participant tile with reactive camera-off state
// ─────────────────────────────────────────────────────────────────────────────
const VideoTile = React.memo(({ stream, socketId, username, mediaState }) => {
    const videoRef = useRef();
    const initial  = (username || '?')[0].toUpperCase();

    const isVideoLive = (s) =>
        !!(s && s.getVideoTracks().some(t => t.readyState === 'live' && t.enabled));

    const [hasVideo, setHasVideo] = useState(() => isVideoLive(stream));

    useEffect(() => {
        if (videoRef.current && stream) videoRef.current.srcObject = stream;

        if (!stream) { setHasVideo(false); return; }

        const update = () => setHasVideo(isVideoLive(stream));
        update();

        const tracks = stream.getVideoTracks();
        tracks.forEach(t => { t.onmute = update; t.onunmute = update; t.onended = update; });
        stream.onaddtrack    = update;
        stream.onremovetrack = update;

        return () => {
            tracks.forEach(t => { t.onmute = null; t.onunmute = null; t.onended = null; });
            stream.onaddtrack    = null;
            stream.onremovetrack = null;
        };
    }, [stream]);

    // Use media state from props if available
    const videoOn = mediaState?.video !== undefined ? mediaState.video : hasVideo;
    const audioOn = mediaState?.audio !== undefined ? mediaState.audio : true;

    return (
        <div className={`video-card ${!videoOn ? 'video-card--off' : ''}`}>
            <video
                data-socket={socketId}
                ref={videoRef}
                autoPlay
                className={videoOn ? '' : 'video-hidden'}
            />
            {!videoOn && (
                <div className="video-avatar-placeholder">
                    <div className="video-avatar-ring">
                        <span className="video-avatar-initial">{initial}</span>
                    </div>
                    <span className="video-avatar-name">{username || 'User'}</span>
                    <span className="video-cam-off-label">
                        <VideocamOffIcon sx={{ fontSize: '1rem' }} /> Camera off
                    </span>
                </div>
            )}
            <div className="video-status-indicators">
                <span className="video-name">{username}</span>
                <div className="media-status-icons">
                    {!audioOn && (
                        <span className="status-icon muted" title="Microphone muted">
                            <MicOffIcon sx={{ fontSize: '1rem' }} />
                        </span>
                    )}
                    {!videoOn && (
                        <span className="status-icon video-off" title="Camera off">
                            <VideocamOffIcon sx={{ fontSize: '1rem' }} />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — silent audio track & blank video track (used when camera is off)
// ─────────────────────────────────────────────────────────────────────────────
const createSilentTrack = () => {
    const ctx        = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst        = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
};

const createBlackTrack = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement('canvas'), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    return Object.assign(canvas.captureStream().getVideoTracks()[0], { enabled: false });
};

const createBlankStream = () => new MediaStream([createBlackTrack(), createSilentTrack()]);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function VideoMeetComponent() {

    const navigate = useNavigate();
    const { getUserProfile } = useContext(AuthContext);

    // Refs
    const socketRef       = useRef();
    const socketIdRef     = useRef();
    const localVideoRef   = useRef();
    const videoListRef    = useRef([]);
    const messagesEndRef  = useRef();
    const fileInputRef    = useRef();

    // Device availability
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState(false);

    // Media state
    let [video,  setVideo]  = useState();
    let [audio,  setAudio]  = useState();
    let [screen, setScreen] = useState();

    // Refs to track current media state for socket handlers (avoids stale closures)
    const videoStateRef = useRef(video);
    const audioStateRef = useRef(audio);

    // UI panels
    let [showModal,      setModal]      = useState(false);
    let [showUsersPanel, setShowUsersPanel] = useState(false);
    let [showNotepad,    setShowNotepad]    = useState(false);

    // Chat
    let [messages,    setMessages]    = useState([]);
    let [message,     setMessage]     = useState('');
    let [newMessages, setNewMessages] = useState(0);
    let [selectedFile, setSelectedFile] = useState(null);

    // Lobby / user identity
    let [askForUsername, setAskForUsername] = useState(true);
    let [username,       setUsername]       = useState('');
    let [usernameError,  setUsernameError]  = useState(false);

    // Lobby media controls (refs keep async getPermissions in sync)
    let [lobbyVideo, setLobbyVideo] = useState(true);
    let [lobbyAudio, setLobbyAudio] = useState(true);
    const lobbyVideoRef = useRef(true);
    const lobbyAudioRef = useRef(true);

    // Participants
    const [socketToUsername, setSocketToUsername] = useState({});
    const [connectedUsers,   setConnectedUsers]   = useState([]);
    const [participantMediaState, setParticipantMediaState] = useState({});

    // Host features
    const [hostSocketId, setHostSocketId] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [isRoomLocked, setIsRoomLocked] = useState(false);
    const [showKickConfirm, setShowKickConfirm] = useState(null);
    const [showTransferConfirm, setShowTransferConfirm] = useState(null);

    // Flash notifications
    const [notification, setNotification] = useState(null);

    // Share prompt
    const [showSharePrompt, setShowSharePrompt] = useState(true);
    const [shareCopied, setShareCopied] = useState(false);

    // Remote video streams
    let [videos, setVideos] = useState([]);

    // ── Permissions & initial stream ────────────────────────────────────────
    const getPermissions = async () => {
        try {
            const vid = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoAvailable(!!vid);
            vid?.getTracks().forEach(t => t.stop());

            const aud = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioAvailable(!!aud);
            aud?.getTracks().forEach(t => t.stop());

            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            if (stream) {
                window.localStream = stream;
                // Honour lobby toggles the user may have clicked while we were loading
                if (!lobbyVideoRef.current) stream.getVideoTracks().forEach(t => t.stop());
                if (!lobbyAudioRef.current) stream.getAudioTracks().forEach(t => t.stop());
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Permission error:', err);
        }
    };

    useEffect(() => { getPermissions(); }, []);

    // Keep refs in sync with media state (for socket handlers)
    useEffect(() => {
        videoStateRef.current = video;
        audioStateRef.current = audio;
    }, [video, audio]);

    useEffect(() => {
        getUserProfile()
            .then(data => { if (data?.name) setUsername(data.name); })
            .catch(() => {});
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.localStream?.getTracks().forEach(t => t.stop());
            Object.values(connections).forEach(c => c.close());
            socketRef.current?.disconnect();
        };
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Local stream management ─────────────────────────────────────────────
    const onLocalStreamReady = (stream) => {
        try { window.localStream?.getTracks().forEach(t => t.stop()); } catch (_) {}

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        // Re-offer to all existing peers with the new stream
        for (const id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(stream);
            connections[id].createOffer()
                .then(desc => connections[id].setLocalDescription(desc))
                .then(() => socketRef.current.emit('signal', id,
                    JSON.stringify({ sdp: connections[id].localDescription })))
                .catch(console.error);
        }

        // When a track ends, fall back to blank stream
        stream.getTracks().forEach(track => {
            track.onended = () => {
                setVideo(false);
                setAudio(false);
                try { localVideoRef.current.srcObject?.getTracks().forEach(t => t.stop()); } catch (_) {}

                const blank = createBlankStream();
                window.localStream = blank;
                localVideoRef.current.srcObject = blank;

                for (const id in connections) {
                    connections[id].addStream(blank);
                    connections[id].createOffer()
                        .then(desc => connections[id].setLocalDescription(desc))
                        .then(() => socketRef.current.emit('signal', id,
                            JSON.stringify({ sdp: connections[id].localDescription })))
                        .catch(console.error);
                }
            };
        });
    };

    const getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video, audio })
                .then(onLocalStreamReady)
                .catch(console.error);
        } else {
            try { localVideoRef.current.srcObject?.getTracks().forEach(t => t.stop()); } catch (_) {}
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) getUserMedia();
    }, [video, audio]);

    // ── Screen share ────────────────────────────────────────────────────────
    const onDisplayStreamReady = (stream) => {
        try { window.localStream?.getTracks().forEach(t => t.stop()); } catch (_) {}

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (const id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(stream);
            connections[id].createOffer()
                .then(desc => connections[id].setLocalDescription(desc))
                .then(() => socketRef.current.emit('signal', id,
                    JSON.stringify({ sdp: connections[id].localDescription })))
                .catch(console.error);
        }

        stream.getTracks().forEach(track => {
            track.onended = () => {
                setScreen(false);
                try { localVideoRef.current.srcObject?.getTracks().forEach(t => t.stop()); } catch (_) {}
                const blank = createBlankStream();
                window.localStream = blank;
                localVideoRef.current.srcObject = blank;
                getUserMedia();
            };
        });
    };

    const getDisplayMedia = () => {
        if (screen && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(onDisplayStreamReady)
                .catch(console.error);
        }
    };

    useEffect(() => {
        if (screen !== undefined) getDisplayMedia();
    }, [screen]);

    // ── WebRTC signalling ───────────────────────────────────────────────────
    const gotMessageFromServer = (fromId, rawMessage) => {
        const signal = JSON.parse(rawMessage);

        if (signal.sdp) {
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if (signal.sdp.type !== 'offer') return;
                    connections[fromId].createAnswer()
                        .then(desc => connections[fromId].setLocalDescription(desc))
                        .then(() => socketRef.current.emit('signal', fromId,
                            JSON.stringify({ sdp: connections[fromId].localDescription })))
                        .catch(console.error);
                })
                .catch(console.error);
        }

        if (signal.ice) {
            connections[fromId]
                .addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(console.error);
        }
    };

    // ── Chat ────────────────────────────────────────────────────────────────
    const addMessage = (data, sender, senderSocketId, type = 'text') => {
        setMessages(prev => [...prev, { sender, data, type }]);
        if (senderSocketId !== socketIdRef.current) {
            setNewMessages(prev => prev + 1);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            e.target.value = '';
            return;
        }

        // Store file for preview, don't send yet
        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedFile({
                name: file.name,
                size: file.size,
                type: file.type,
                data: event.target.result
            });
        };
        reader.readAsDataURL(file);
        
        // Reset file input
        e.target.value = '';
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
    };

    const sendFile = () => {
        if (selectedFile) {
            socketRef.current.emit('file-message', selectedFile, username);
            setSelectedFile(null);
        }
    };

    const downloadFile = (fileData) => {
        const link = document.createElement('a');
        link.href = fileData.data;
        link.download = fileData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('sheet') || type.includes('excel')) return '📊';
        if (type.includes('zip') || type.includes('rar')) return '📦';
        return '📎';
    };

    const sendMessage = () => {
        // Send file if selected
        if (selectedFile) {
            sendFile();
            return;
        }
        
        // Send text message
        if (!message.trim()) return;
        socketRef.current.emit('chat-message', message, username);
        if (message.toLowerCase().startsWith('@ai')) askAI(message);
        setMessage('');
    };

    const askAI = async (userMessage) => {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY });

        // Detect "@ai from chat <question>" — includes full chat history as context
        const fromChatMatch = userMessage.match(/@ai\s+from\s+chat\s+(.+)/i);
        let prompt;

        if (fromChatMatch) {
            const question = fromChatMatch[1].trim();
            const transcript = messages
                .filter(m => m.type === 'text' && m.sender !== AI_SENDER)
                .map(m => `[${m.sender}]: ${m.data}`)
                .join('\n');
            prompt = transcript
                ? `You are an AI assistant in a video meeting. Below is the full chat transcript so far — use it as context to answer the question.\n\nChat transcript:\n${transcript}\n\nUser's question: ${question}`
                : question;
        } else {
            // Plain "@ai <question>" — no chat context
            prompt = userMessage.replace(/@ai/i, '').trim();
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.1-flash-lite-preview',
                contents: prompt,
            });
            socketRef.current.emit('chat-message', response.text, AI_SENDER);
        } catch (e) {
            const code = e?.status || e?.code;
            const msg =
                code === 429 ? 'Rate limit reached. Please wait a moment.' :
                code === 503 ? 'AI is currently busy. Please try again shortly.' :
                (code === 401 || code === 403) ? 'Invalid API key.' :
                'Something went wrong. Try again.';
            socketRef.current.emit('chat-message', msg, AI_SENDER);
        }
    };

    const parseMarkdown = (text) => text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g,     '<em>$1</em>')
        .replace(/`(.*?)`/g,       '<code>$1</code>')
        .replace(/\n/g,            '<br/>');

    const downloadChat = () => {
        const stripHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
        const text = messages.map(m => `[${m.sender}]: ${stripHtml(m.data)}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: 'chat.txt' });
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Socket connection ───────────────────────────────────────────────────

    // Show flash notification
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const connectToSocketServer = () => {
        socketRef.current = io.connect(SERVER_URL, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketRef.current.emit('set-username', username);
            socketIdRef.current = socketRef.current.id;

            // Broadcast initial media state so others know our audio/video status
            setTimeout(() => {
                if (socketRef.current) {
                    socketRef.current.emit('media-state-change', {
                        video: videoStateRef.current,
                        audio: audioStateRef.current
                    });
                }
            }, 500);

            setConnectedUsers([{ socketId: socketRef.current.id, name: username }]);

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on('file-message', (fileData, sender, socketIdSender) => {
                addMessage(fileData, sender, socketIdSender, 'file');
            });

            socketRef.current.on('media-state-change', (socketId, mediaState) => {
                setParticipantMediaState(prev => ({
                    ...prev,
                    [socketId]: mediaState
                }));
            });

            socketRef.current.on('user-username', (socketId, uname) => {
                setSocketToUsername(prev => ({ ...prev, [socketId]: uname }));
                setConnectedUsers(prev => {
                    const exists = prev.find(u => u.socketId === socketId);
                    if (exists) return prev.map(u => u.socketId === socketId ? { ...u, name: uname } : u);
                    return [...prev, { socketId, name: uname }];
                });
            });

            socketRef.current.on('user-left', (id) => {
                setVideos(prev => prev.filter(v => v.socketId !== id));
                setConnectedUsers(prev => prev.filter(u => u.socketId !== id));
            });

            socketRef.current.on('user-joined', (id, clients) => {
                if (!Array.isArray(clients)) return;

                clients.forEach((peerId) => {
                    connections[peerId] = new RTCPeerConnection(peerConfig);

                    connections[peerId].onicecandidate = (event) => {
                        if (event.candidate) {
                            socketRef.current.emit('signal', peerId,
                                JSON.stringify({ ice: event.candidate }));
                        }
                    };

                    connections[peerId].onaddstream = (event) => {
                        const exists = videoListRef.current.find(v => v.socketId === peerId);
                        if (exists) {
                            setVideos(prev => {
                                const updated = prev.map(v =>
                                    v.socketId === peerId ? { ...v, stream: event.stream } : v);
                                videoListRef.current = updated;
                                return updated;
                            });
                        } else {
                            setVideos(prev => {
                                const updated = [...prev, { socketId: peerId, stream: event.stream }];
                                videoListRef.current = updated;
                                return updated;
                            });
                        }
                    };

                    const localStream = window.localStream ?? (() => {
                        const blank = createBlankStream();
                        window.localStream = blank;
                        return blank;
                    })();
                    connections[peerId].addStream(localStream);

                    if (peerId !== socketIdRef.current) {
                        setConnectedUsers(prev => {
                            if (prev.find(u => u.socketId === peerId)) return prev;
                            return [...prev, { socketId: peerId, name: socketToUsername[peerId] || 'User' }];
                        });
                    }
                });

                // If we're the newly joined user, create offers to everyone
                if (id === socketIdRef.current) {
                    for (const peerId in connections) {
                        if (peerId === socketIdRef.current) continue;
                        try { connections[peerId].addStream(window.localStream); } catch (_) {}
                        connections[peerId].createOffer()
                            .then(desc => connections[peerId].setLocalDescription(desc))
                            .then(() => socketRef.current.emit('signal', peerId,
                                JSON.stringify({ sdp: connections[peerId].localDescription })))
                            .catch(console.error);
                    }
                }
            });

            // ── Host Feature Events ─────────────────────────────────────────

            socketRef.current.on('room-host-info', ({ hostId, isLocked }) => {
                setHostSocketId(hostId);
                setIsHost(hostId === socketRef.current.id);
                setIsRoomLocked(isLocked);
            });

            socketRef.current.on('force-muted', () => {
                setAudio(false);
                if (socketRef.current) {
                    socketRef.current.emit('media-state-change', {
                        video: videoStateRef.current,
                        audio: false
                    });
                }
                showNotification('The host has muted your microphone', 'warning');
            });

            socketRef.current.on('force-video-off', () => {
                setVideo(false);
                if (socketRef.current) {
                    socketRef.current.emit('media-state-change', {
                        video: false,
                        audio: audioStateRef.current
                    });
                }
                showNotification('The host has turned off your camera', 'warning');
            });

            socketRef.current.on('kicked-from-room', ({ reason }) => {
                showNotification('You have been removed from the meeting by the host', 'error');
                setTimeout(() => handleEndCall(), 2000);
            });

            socketRef.current.on('join-rejected', ({ reason }) => {
                if (reason === 'room_locked') {
                    showNotification('This meeting room is locked and not accepting new participants', 'error');
                    setTimeout(() => navigate('/'), 2000);
                }
            });

            socketRef.current.on('room-lock-changed', ({ isLocked, hostId }) => {
                setIsRoomLocked(isLocked);
            });

            socketRef.current.on('host-changed', ({ newHostId, oldHostId }) => {
                setHostSocketId(newHostId);
                setIsHost(newHostId === socketRef.current.id);

                if (newHostId === socketRef.current.id) {
                    showNotification('You are now the host of this meeting', 'success');
                }
            });
        });
    };

    // ── Controls ────────────────────────────────────────────────────────────
    const connect = () => {
        if (!username.trim()) { setUsernameError(true); return; }
        setUsernameError(false);
        setAskForUsername(false);
        // Carry lobby toggle states into the call
        const initialVideo = videoAvailable && lobbyVideo;
        const initialAudio = audioAvailable && lobbyAudio;
        setVideo(initialVideo);
        setAudio(initialAudio);
        // Update refs immediately so they're available for socket handlers
        videoStateRef.current = initialVideo;
        audioStateRef.current = initialAudio;
        connectToSocketServer();
    };

    const handleEndCall = () => {
        try { localVideoRef.current.srcObject?.getTracks().forEach(t => t.stop()); } catch (_) {}
        navigate('/');
    };

    // ── Host Controls ───────────────────────────────────────────────────────

    const handleMuteUser = (targetSocketId) => {
        const roomPath = window.location.href;
        socketRef.current.emit('host-force-mute-user', {
            targetSocketId,
            roomPath
        });
    };

    const handleVideoOffUser = (targetSocketId) => {
        const roomPath = window.location.href;
        socketRef.current.emit('host-force-video-off', {
            targetSocketId,
            roomPath
        });
    };

    const handleKickUser = (targetSocketId) => {
        const roomPath = window.location.href;
        socketRef.current.emit('host-kick-user', {
            targetSocketId,
            roomPath
        });
        setShowKickConfirm(null);
    };

    const handleToggleRoomLock = () => {
        const roomPath = window.location.href;
        socketRef.current.emit('host-toggle-room-lock', {
            roomPath,
            locked: !isRoomLocked
        });
    };

    const handleTransferHost = (targetSocketId) => {
        const roomPath = window.location.href;
        socketRef.current.emit('host-transfer-host', {
            targetSocketId,
            roomPath
        });
        setShowTransferConfirm(null);
    };

    // ────────────────────────────────────────────────────────────────────────

    const handleChatToggle = () => {
        if (!showModal) { setShowUsersPanel(false); setNewMessages(0); }
        setModal(prev => !prev);
    };

    const handleUsersToggle = () => {
        if (!showUsersPanel) setModal(false);
        setShowUsersPanel(prev => !prev);
    };

    const handleNotepadToggle = () => {
        setShowNotepad(prev => !prev);
    };

    const handleShareRoom = async () => {
        const shareUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        }
    };

    // ── TextField sx (reused) ───────────────────────────────────────────────
    const textFieldSx = {
        '& .MuiOutlinedInput-root': {
            color: 'var(--text-primary)',
            '& fieldset':           { borderColor: 'var(--glass-border)' },
            '&:hover fieldset':     { borderColor: 'var(--text-secondary)' },
            '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
        },
        '& .MuiInputLabel-root':            { color: 'var(--text-secondary)' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent-primary)' },
    };

    // ── Render ───────────────────────────────────────────────────────────────
    if (askForUsername) {
        return (
            <div className="lobbyContainer">
                <div className="lobbyForm">
                    <h2 className="lobbySubTitle">Enter into Lobby</h2>

                    <TextField
                        id="lobby-name"
                        label="Your Name"
                        value={username}
                        variant="outlined"
                        error={usernameError}
                        helperText={usernameError ? 'Name is required to join' : ''}
                        onChange={e => { setUsername(e.target.value); setUsernameError(false); }}
                        sx={textFieldSx}
                    />

                    <div className="lobby-media-controls">
                        <IconButton
                            onClick={() => {
                                const newState = !lobbyVideo;
                                setLobbyVideo(newState);
                                lobbyVideoRef.current = newState; // keep ref in sync
                                if (!newState) {
                                    // Stop tracks → releases camera hardware (turns off camera light)
                                    window.localStream?.getVideoTracks().forEach(t => t.stop());
                                } else {
                                    // Re-acquire camera
                                    navigator.mediaDevices.getUserMedia({ video: true })
                                        .then(stream => {
                                            const track = stream.getVideoTracks()[0];
                                            if (!track) return;
                                            if (window.localStream) {
                                                window.localStream.getVideoTracks().forEach(t => window.localStream.removeTrack(t));
                                                window.localStream.addTrack(track);
                                            } else {
                                                window.localStream = stream;
                                            }
                                            if (localVideoRef.current) localVideoRef.current.srcObject = window.localStream;
                                        })
                                        .catch(console.error);
                                }
                            }}
                            className={lobbyVideo ? 'activeIcon' : 'inactiveIcon'}
                            title={lobbyVideo ? 'Turn off camera' : 'Turn on camera'}
                        >
                            {lobbyVideo ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                const newState = !lobbyAudio;
                                setLobbyAudio(newState);
                                lobbyAudioRef.current = newState; // keep ref in sync
                                if (!newState) {
                                    // Stop tracks → releases microphone hardware
                                    window.localStream?.getAudioTracks().forEach(t => t.stop());
                                } else {
                                    // Re-acquire mic
                                    navigator.mediaDevices.getUserMedia({ audio: true })
                                        .then(stream => {
                                            const track = stream.getAudioTracks()[0];
                                            if (!track) return;
                                            if (window.localStream) {
                                                window.localStream.getAudioTracks().forEach(t => window.localStream.removeTrack(t));
                                                window.localStream.addTrack(track);
                                            } else {
                                                window.localStream = stream;
                                            }
                                        })
                                        .catch(console.error);
                                }
                            }}
                            className={lobbyAudio ? 'activeIcon' : 'inactiveIcon'}
                            title={lobbyAudio ? 'Mute' : 'Unmute'}
                        >
                            {lobbyAudio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                    </div>

                    <Button
                        variant="contained"
                        onClick={connect}
                        sx={{
                            background: 'var(--accent-gradient)',
                            fontWeight: 600,
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: '0 8px 16px rgba(255, 152, 57, 0.3)',
                        }}
                    >
                        Join Meeting
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<CallEndIcon />}
                        onClick={handleEndCall}
                        sx={{
                            background: 'linear-gradient(135deg, #ff4757, #c0392b)',
                            color: '#fff',
                            fontWeight: 600,
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #ff6b81, #ff4757)',
                                boxShadow: '0 6px 20px rgba(255, 71, 87, 0.55)',
                            },
                        }}
                    >
                        Leave
                    </Button>
                </div>

                {lobbyVideo ? (
                    <video ref={localVideoRef} autoPlay muted className="lobbyPreview" />
                ) : (
                    <div className="lobbyPreview lobbyVideoOff">
                        <div className="video-avatar-placeholder">
                            <div className="video-avatar-ring">
                                <span className="video-avatar-initial">{(username || '?')[0].toUpperCase()}</span>
                            </div>
                            <p className="video-avatar-name">{username || 'You'}</p>
                            <span className="video-cam-off-label">
                                <VideocamOffIcon sx={{ fontSize: '1rem' }} />
                                Camera Off
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="meetVideoContainer">

            {/* ── Share Room Prompt ────────────────────────────────────────── */}
            {showSharePrompt && (
                <div className="share-prompt">
                    <div className="share-prompt-content">
                        <ShareIcon className="share-prompt-icon" />
                        <div className="share-prompt-text">
                            <span className="share-prompt-title">Invite others to join</span>
                            <span className="share-prompt-subtitle">Share this meeting link</span>
                        </div>
                        <button
                            className={`share-prompt-btn ${shareCopied ? 'copied' : ''}`}
                            onClick={handleShareRoom}
                        >
                            {shareCopied ? (
                                <>
                                    <CheckIcon />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <ContentCopyIcon />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </button>
                    </div>
                    <button
                        className="share-prompt-close"
                        onClick={() => setShowSharePrompt(false)}
                        title="Dismiss"
                    >
                        <CloseIcon />
                    </button>
                </div>
            )}

            {/* ── Chat Panel ──────────────────────────────────────────── */}
            {showModal && (
                <div className="chatRoom">
                    <div className="chatHeader">
                        <h1>Chat</h1>
                        <IconButton
                            onClick={downloadChat}
                            title="Download chat"
                            size="small"
                            sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)' } }}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </div>

                    <div className="chatContainer">
                        <div className="chattingDisplay">
                            {messages.length === 0 && (
                                <div className="chat-empty-state">
                                    <span>💬</span>
                                    <p>No messages yet.<br />Type <strong>@ai</strong> to ask the AI, or <strong>@ai from chat</strong> to ask with full chat context!</p>
                                </div>
                            )}
                            {messages.map((item, index) => {
                                const isAI  = item.sender === AI_SENDER;
                                const isOwn = item.sender === username;
                                
                                if (item.type === 'file') {
                                    return (
                                        <div
                                            className={`msg-box file-msg ${isOwn ? 'own' : 'other'}`}
                                            key={index}
                                        >
                                            <span>{item.sender}</span>
                                            <div className="file-content">
                                                <div className="file-info">
                                                    <span className="file-icon">{getFileIcon(item.data.type)}</span>
                                                    <div className="file-details">
                                                        <p className="file-name">{item.data.name}</p>
                                                        <p className="file-size">{formatFileSize(item.data.size)}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="file-download-btn"
                                                    onClick={() => downloadFile(item.data)}
                                                    title="Download file"
                                                >
                                                    <DownloadIcon sx={{ fontSize: '1.2rem' }} />
                                                </button>
                                            </div>
                                            {item.data.type.startsWith('image/') && (
                                                <img 
                                                    src={item.data.data} 
                                                    alt={item.data.name}
                                                    className="file-preview-img"
                                                />
                                            )}
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div
                                        className={`msg-box ${isOwn ? 'own' : isAI ? 'ai' : 'other'}`}
                                        key={index}
                                    >
                                        <span>{item.sender}</span>
                                        <p dangerouslySetInnerHTML={{ __html: parseMarkdown(item.data) }} />
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="chattingArea">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        {!selectedFile && (
                            <button onClick={() => fileInputRef.current?.click()}>
                                <AttachFileIcon/>
                            </button>
                        )}
                        <div className="chat-input-wrapper">
                            {selectedFile ? (
                                <div className="file-preview-chip">
                                    <span className="file-chip-icon">{getFileIcon(selectedFile.type)}</span>
                                    <span className="file-chip-name">{selectedFile.name}</span>
                                    <span className="file-chip-size">({formatFileSize(selectedFile.size)})</span>
                                    <button 
                                        className="file-chip-clear"
                                        onClick={clearSelectedFile}
                                        title="Remove file"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                                    placeholder="Message · @ai <question> · @ai from chat <question>"
                                />
                            )}
                        </div>
                        <button onClick={sendMessage}><SendIcon sx={{ fontSize: '1.2rem' }} /></button>
                    </div>
                </div>
            )}

            {/* ── Participants Panel ───────────────────────────────────── */}
            {showUsersPanel && (
                <div className="usersPanel">
                    <div className="chatHeader">
                        <h1>Participants ({connectedUsers.length})</h1>
                        {isHost && (
                            <IconButton
                                onClick={handleToggleRoomLock}
                                title={isRoomLocked ? "Unlock room" : "Lock room"}
                                size="small"
                                sx={{
                                    color: isRoomLocked ? '#ff4757' : 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { color: '#fff' }
                                }}
                            >
                                {isRoomLocked ? <LockIcon /> : <LockOpenIcon />}
                            </IconButton>
                        )}
                    </div>

                    {isRoomLocked && (
                        <div className="room-locked-banner">
                            <LockIcon sx={{ fontSize: '1rem' }} />
                            <span>Room is locked - No new participants can join</span>
                        </div>
                    )}

                    <div className="usersList">
                        {connectedUsers.map((user) => {
                            const userMediaState = participantMediaState[user.socketId];
                            const isCurrentUser = user.socketId === socketIdRef.current;
                            const isUserHost = user.socketId === hostSocketId;
                            const videoOn = isCurrentUser ? video : (userMediaState?.video === true);
                            const audioOn = isCurrentUser ? audio : (userMediaState?.audio === true);

                            return (
                                <div className="userItem" key={user.socketId}>
                                    <div className="userAvatar">
                                        {(user.name || 'U')[0].toUpperCase()}
                                        {isUserHost && (
                                            <span className="hostBadge" title="Host">
                                                <StarIcon sx={{ fontSize: '0.9rem' }} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="userInfo">
                                        <span className="userName">
                                            {user.name || 'Unknown'}
                                            {isCurrentUser && (
                                                <span className="youBadge"> (You)</span>
                                            )}
                                            {isUserHost && !isCurrentUser && (
                                                <span className="hostLabel"> (Host)</span>
                                            )}
                                        </span>
                                        <div className="user-media-status">
                                            {!audioOn && (
                                                <span className="status-icon muted" title="Muted">
                                                    <MicOffIcon sx={{ fontSize: '0.9rem' }} />
                                                </span>
                                            )}
                                            {!videoOn && (
                                                <span className="status-icon video-off" title="Camera off">
                                                    <VideocamOffIcon sx={{ fontSize: '0.9rem' }} />
                                                </span>
                                            )}
                                            {audioOn && videoOn && (
                                                <span className="userStatus">● In call</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Host Controls */}
                                    {isHost && !isCurrentUser && (
                                        <div className="hostControls">
                                            {/* Only show mute button if user's audio is ON */}
                                            {audioOn && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleMuteUser(user.socketId)}
                                                    title="Mute participant"
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                        '&:hover': { color: '#ff4757' }
                                                    }}
                                                >
                                                    <MicOffIcon sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                            )}

                                            {/* Only show video-off button if user's video is ON */}
                                            {videoOn && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleVideoOffUser(user.socketId)}
                                                    title="Turn off camera"
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                        '&:hover': { color: '#ff4757' }
                                                    }}
                                                >
                                                    <VideocamOffIcon sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                            )}

                                            <IconButton
                                                size="small"
                                                onClick={() => setShowTransferConfirm(user.socketId)}
                                                title="Make host"
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    '&:hover': { color: '#ffd700' }
                                                }}
                                            >
                                                <StarIcon sx={{ fontSize: '1rem' }} />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                onClick={() => setShowKickConfirm(user.socketId)}
                                                title="Remove participant"
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    '&:hover': { color: '#ff4757' }
                                                }}
                                            >
                                                <PersonRemoveIcon sx={{ fontSize: '1rem' }} />
                                            </IconButton>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Kick Confirmation Dialog */}
            {showKickConfirm && (
                <div className="confirmDialog" onClick={() => setShowKickConfirm(null)}>
                    <div className="confirmDialogContent" onClick={(e) => e.stopPropagation()}>
                        <h3>Remove Participant?</h3>
                        <p>
                            Are you sure you want to remove{' '}
                            {connectedUsers.find(u => u.socketId === showKickConfirm)?.name || 'this user'}{' '}
                            from the meeting?
                        </p>
                        <div className="confirmDialogActions">
                            <Button
                                onClick={() => setShowKickConfirm(null)}
                                variant="outlined"
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: '#fff',
                                    '&:hover': { borderColor: '#fff' }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleKickUser(showKickConfirm)}
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #ff4757, #c0392b)',
                                    color: '#fff',
                                    '&:hover': { background: 'linear-gradient(135deg, #ff6b6b, #e74c3c)' }
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Host Confirmation Dialog */}
            {showTransferConfirm && (
                <div className="confirmDialog" onClick={() => setShowTransferConfirm(null)}>
                    <div className="confirmDialogContent" onClick={(e) => e.stopPropagation()}>
                        <h3>Transfer Host Privileges?</h3>
                        <p>
                            Are you sure you want to make{' '}
                            {connectedUsers.find(u => u.socketId === showTransferConfirm)?.name || 'this user'}{' '}
                            the new host? You will lose host privileges.
                        </p>
                        <div className="confirmDialogActions">
                            <Button
                                onClick={() => setShowTransferConfirm(null)}
                                variant="outlined"
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: '#fff',
                                    '&:hover': { borderColor: '#fff' }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleTransferHost(showTransferConfirm)}
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #ffd700, #ffb700)',
                                    color: '#000',
                                    fontWeight: 600,
                                    '&:hover': { background: 'linear-gradient(135deg, #ffe44d, #ffd700)' }
                                }}
                            >
                                Transfer
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Collaborative Notepad ────────────────────────────────────── */}
            {showNotepad && (
                <CollabNotepad
                    roomId={window.location.pathname}
                    userName={username}
                    onClose={() => setShowNotepad(false)}
                />
            )}

            {/* ── Control Bar ─────────────────────────────────────────── */}
            <div className="buttonContainers">
                <IconButton
                    onClick={() => {
                        setVideo(v => {
                            const newState = !v;
                            // Broadcast media state change
                            if (socketRef.current) {
                                socketRef.current.emit('media-state-change', {
                                    video: newState,
                                    audio: audio
                                });
                            }
                            return newState;
                        });
                    }}
                    className={video ? 'activeIcon' : 'inactiveIcon'}
                    title={video ? 'Turn off camera' : 'Turn on camera'}
                >
                    {video ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>

                <IconButton onClick={handleEndCall} className="endCallIcon" title="End call">
                    <CallEndIcon />
                </IconButton>

                <IconButton
                    onClick={() => {
                        setAudio(a => {
                            const newState = !a;
                            // Broadcast media state change
                            if (socketRef.current) {
                                socketRef.current.emit('media-state-change', {
                                    video: video,
                                    audio: newState
                                });
                            }
                            return newState;
                        });
                    }}
                    className={audio ? 'activeIcon' : 'inactiveIcon'}
                    title={audio ? 'Mute' : 'Unmute'}
                >
                    {audio ? <MicIcon /> : <MicOffIcon />}
                </IconButton>

                <IconButton
                    onClick={() => setScreen(s => !s)}
                    className={screen ? 'activeIcon' : 'inactiveIcon'}
                    title={screen ? 'Stop sharing' : 'Share screen'}
                    disabled={!screenAvailable}
                >
                    {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton>

                <Badge badgeContent={newMessages} max={99} color="error">
                    <IconButton
                        onClick={handleChatToggle}
                        className={showModal ? 'activeIcon' : 'inactiveIcon'}
                        title="Chat"
                    >
                        <ChatIcon />
                    </IconButton>
                </Badge>

                <Badge badgeContent={connectedUsers.length} color="primary">
                    <IconButton
                        onClick={handleUsersToggle}
                        className={showUsersPanel ? 'activeIcon' : 'inactiveIcon'}
                        title="Participants"
                    >
                        <PeopleIcon />
                    </IconButton>
                </Badge>

                <IconButton
                    onClick={handleNotepadToggle}
                    className={showNotepad ? 'activeIcon' : 'inactiveIcon'}
                    title="Collaborative Notes"
                >
                    <EditNoteIcon />
                </IconButton>
            </div>

            {/* ── Local Video PIP ──────────────────────────────────────── */}
            <div className="localVideoWrapper">
                <video
                    ref={localVideoRef}
                    className="meetUserVideo"
                    autoPlay
                    muted
                    style={{ display: video === false ? 'none' : undefined }}
                />
                {video === false && (
                    <div className="localVideoAvatar">
                        <span>{(username || 'Y')[0].toUpperCase()}</span>
                        <small>Cam off</small>
                    </div>
                )}
            </div>

            {/* ── Remote Videos ────────────────────────────────────────── */}
            <div className="conferenceView">
                {videos.map((v) => (
                    <VideoTile
                        key={v.socketId}
                        stream={v.stream}
                        socketId={v.socketId}
                        username={socketToUsername[v.socketId] || ''}
                        mediaState={participantMediaState[v.socketId]}
                    />
                ))}
            </div>

            {/* Flash Notification */}
            {notification && (
                <div className={`flash-notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}
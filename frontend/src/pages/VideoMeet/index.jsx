import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/videoComponent.css";
import io from 'socket.io-client';
import { GoogleGenAI } from "@google/genai";
import { AuthContext } from '../../context/AuthContext';

// Import our new components
import { createBlankStream } from './utils/mediaHelpers';
import VideoTile from './components/VideoTile';
import Lobby from './components/Lobby';
import ChatPanel from './components/ChatPanel';
import ParticipantsPanel from './components/ParticipantsPanel';
import ConfirmDialog from './components/ConfirmDialog';
import ControlBar from './components/ControlBar';

const SERVER_URL = "http://localhost:3000";
const AI_SENDER  = "🤖 AI Assistant";

// Module-level WebRTC peer connections map
const connections = {};

const peerConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.localStream?.getTracks().forEach(t => t.stop());
            Object.values(connections).forEach(c => c.close());
            socketRef.current?.disconnect();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // ── Render ───────────────────────────────────────────────────────────────
    if (askForUsername) {
        return (
            <Lobby 
                username={username}
                usernameError={usernameError}
                setUsername={setUsername}
                setUsernameError={setUsernameError}
                lobbyVideo={lobbyVideo}
                setLobbyVideo={setLobbyVideo}
                lobbyVideoRef={lobbyVideoRef}
                lobbyAudio={lobbyAudio}
                setLobbyAudio={setLobbyAudio}
                lobbyAudioRef={lobbyAudioRef}
                localVideoRef={localVideoRef}
                connect={connect}
                handleEndCall={handleEndCall}
            />
        );
    }

    return (
        <div className="meetVideoContainer">
            <ChatPanel 
                showModal={showModal}
                messages={messages}
                username={username}
                AI_SENDER={AI_SENDER}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                clearSelectedFile={clearSelectedFile}
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
                messagesEndRef={messagesEndRef}
                handleChatToggle={handleChatToggle}
            />

            <ParticipantsPanel 
                showUsersPanel={showUsersPanel}
                connectedUsers={connectedUsers}
                isHost={isHost}
                isRoomLocked={isRoomLocked}
                handleToggleRoomLock={handleToggleRoomLock}
                participantMediaState={participantMediaState}
                socketIdRef={socketIdRef}
                hostSocketId={hostSocketId}
                video={video}
                audio={audio}
                handleMuteUser={handleMuteUser}
                handleVideoOffUser={handleVideoOffUser}
                setShowTransferConfirm={setShowTransferConfirm}
                setShowKickConfirm={setShowKickConfirm}
                handleUsersToggle={handleUsersToggle}
            />

            <ConfirmDialog 
                showKickConfirm={showKickConfirm}
                setShowKickConfirm={setShowKickConfirm}
                handleKickUser={handleKickUser}
                showTransferConfirm={showTransferConfirm}
                setShowTransferConfirm={setShowTransferConfirm}
                handleTransferHost={handleTransferHost}
                connectedUsers={connectedUsers}
            />

            <ControlBar 
                video={video}
                setVideo={setVideo}
                audio={audio}
                setAudio={setAudio}
                screen={screen}
                setScreen={setScreen}
                screenAvailable={screenAvailable}
                socketRef={socketRef}
                handleEndCall={handleEndCall}
                newMessages={newMessages}
                handleChatToggle={handleChatToggle}
                showModal={showModal}
                connectedUsersLength={connectedUsers.length}
                handleUsersToggle={handleUsersToggle}
                showUsersPanel={showUsersPanel}
            />

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

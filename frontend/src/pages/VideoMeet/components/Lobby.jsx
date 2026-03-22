import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

export default function Lobby({
    username,
    usernameError,
    setUsername,
    setUsernameError,
    lobbyVideo,
    setLobbyVideo,
    lobbyVideoRef,
    lobbyAudio,
    setLobbyAudio,
    lobbyAudioRef,
    localVideoRef,
    connect,
    handleEndCall
}) {
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

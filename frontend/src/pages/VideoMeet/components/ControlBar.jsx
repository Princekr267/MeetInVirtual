import React from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';

export default function ControlBar({
    video,
    setVideo,
    audio,
    setAudio,
    screen,
    setScreen,
    screenAvailable,
    socketRef,
    handleEndCall,
    newMessages,
    handleChatToggle,
    showModal,
    connectedUsersLength,
    handleUsersToggle,
    showUsersPanel
}) {
    return (
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

            <Badge badgeContent={connectedUsersLength} color="primary">
                <IconButton
                    onClick={handleUsersToggle}
                    className={showUsersPanel ? 'activeIcon' : 'inactiveIcon'}
                    title="Participants"
                >
                    <PeopleIcon />
                </IconButton>
            </Badge>
        </div>
    );
}

import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import EditNoteIcon from '@mui/icons-material/EditNote';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
    showUsersPanel,
    handleNotepadToggle,
    showNotepad
}) {
    const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
    const moreMenuOpen = Boolean(moreMenuAnchor);

    const handleMoreClick = (event) => {
        setMoreMenuAnchor(event.currentTarget);
    };

    const handleMoreClose = () => {
        setMoreMenuAnchor(null);
    };

    const handleVideoToggle = () => {
        setVideo(v => {
            const newState = !v;
            if (socketRef.current) {
                socketRef.current.emit('media-state-change', {
                    video: newState,
                    audio: audio
                });
            }
            return newState;
        });
    };

    const handleAudioToggle = () => {
        setAudio(a => {
            const newState = !a;
            if (window.localStream) {
                window.localStream.getAudioTracks().forEach(track => {
                    track.enabled = newState;
                });
            }
            if (socketRef.current) {
                socketRef.current.emit('media-state-change', {
                    video: video,
                    audio: newState
                });
            }
            return newState;
        });
    };

    const handleScreenToggle = () => {
        setScreen(s => !s);
    };

    return (
        <div className="buttonContainers">
            {/* Always visible: Video */}
            <IconButton
                onClick={handleVideoToggle}
                className={video ? 'activeIcon' : 'inactiveIcon'}
                title={video ? 'Turn off camera' : 'Turn on camera'}
            >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            {/* Always visible: End Call */}
            <IconButton onClick={handleEndCall} className="endCallIcon" title="End call">
                <CallEndIcon />
            </IconButton>

            {/* Always visible: Mic */}
            <IconButton
                onClick={handleAudioToggle}
                className={audio ? 'activeIcon' : 'inactiveIcon'}
                title={audio ? 'Mute' : 'Unmute'}
            >
                {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {/* Desktop only: Screen Share */}
            <IconButton
                onClick={handleScreenToggle}
                className={`desktopOnly ${screen ? 'activeIcon' : 'inactiveIcon'}`}
                title={screen ? 'Stop sharing' : 'Share screen'}
                disabled={!screenAvailable}
            >
                {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
            </IconButton>

            {/* Always visible: Chat */}
            <Badge badgeContent={newMessages} max={99} color="error">
                <IconButton
                    onClick={handleChatToggle}
                    className={showModal ? 'activeIcon' : 'inactiveIcon'}
                    title="Chat"
                >
                    <ChatIcon />
                </IconButton>
            </Badge>

            {/* Desktop only: Participants */}
            <Badge badgeContent={connectedUsersLength} color="primary" className="desktopOnly">
                <IconButton
                    onClick={handleUsersToggle}
                    className={showUsersPanel ? 'activeIcon' : 'inactiveIcon'}
                    title="Participants"
                >
                    <PeopleIcon />
                </IconButton>
            </Badge>

            {/* Desktop only: Notepad */}
            <IconButton
                onClick={handleNotepadToggle}
                className={`desktopOnly ${showNotepad ? 'activeIcon' : 'inactiveIcon'}`}
                title="Collaborative Notepad"
            >
                <EditNoteIcon />
            </IconButton>

            {/* Mobile only: More menu */}
            <IconButton
                onClick={handleMoreClick}
                className={`mobileOnly ${moreMenuOpen ? 'activeIcon' : 'inactiveIcon'}`}
                title="More options"
            >
                <MoreVertIcon />
            </IconButton>

            {/* More Menu */}
            <Menu
                anchorEl={moreMenuAnchor}
                open={moreMenuOpen}
                onClose={handleMoreClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                PaperProps={{
                    sx: {
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        borderRadius: '12px',
                        minWidth: '200px',
                        '& .MuiMenuItem-root:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                    }
                }}
            >
                <MenuItem
                    onClick={() => { handleScreenToggle(); handleMoreClose(); }}
                    disabled={!screenAvailable}
                >
                    <ListItemIcon sx={{ color: screen ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                        {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                    </ListItemIcon>
                    <ListItemText>{screen ? 'Stop Sharing' : 'Share Screen'}</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => { handleUsersToggle(); handleMoreClose(); }}>
                    <ListItemIcon sx={{ color: showUsersPanel ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                        <Badge badgeContent={connectedUsersLength} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: '16px', height: '16px' } }}>
                            <PeopleIcon />
                        </Badge>
                    </ListItemIcon>
                    <ListItemText>Participants</ListItemText>
                </MenuItem>

                <Divider sx={{ borderColor: 'var(--glass-border)' }} />

                <MenuItem onClick={() => { handleNotepadToggle(); handleMoreClose(); }}>
                    <ListItemIcon sx={{ color: showNotepad ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                        <EditNoteIcon />
                    </ListItemIcon>
                    <ListItemText>Collaborative Notepad</ListItemText>
                </MenuItem>
            </Menu>
        </div>
    );
}

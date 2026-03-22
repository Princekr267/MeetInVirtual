import React from 'react';
import IconButton from '@mui/material/IconButton';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import StarIcon from '@mui/icons-material/Star';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';

export default function ParticipantsPanel({
    showUsersPanel,
    connectedUsers,
    isHost,
    isRoomLocked,
    handleToggleRoomLock,
    participantMediaState,
    socketIdRef,
    hostSocketId,
    video,
    audio,
    handleMuteUser,
    handleVideoOffUser,
    setShowTransferConfirm,
    setShowKickConfirm,
    handleUsersToggle
}) {
    if (!showUsersPanel) return null;

    return (
        <div className="usersPanel">
            <div className="chatHeader">
                <h1>Participants ({connectedUsers.length})</h1>
                <div>
                    {isHost && (
                        <IconButton
                            onClick={handleToggleRoomLock}
                            title={isRoomLocked ? "Unlock room" : "Lock room"}
                            size="small"
                            sx={{
                                color: isRoomLocked ? '#ff4757' : 'rgba(255, 255, 255, 0.6)',
                                '&:hover': { color: '#fff' },
                                mr: 1
                            }}
                        >
                            {isRoomLocked ? <LockIcon /> : <LockOpenIcon />}
                        </IconButton>
                    )}
                    <IconButton
                        onClick={handleUsersToggle}
                        title="Close participants"
                        size="small"
                        sx={{ color: 'var(--text-secondary)', '&:hover': { color: '#ff4757' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
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
    );
}

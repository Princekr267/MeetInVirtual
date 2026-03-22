import React, { useRef, useState, useEffect } from 'react';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicOffIcon from '@mui/icons-material/MicOff';

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

export default VideoTile;

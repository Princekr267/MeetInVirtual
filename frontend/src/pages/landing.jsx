import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import LoginIcon from '@mui/icons-material/Login';
import '../App.css';

// Meeting codes: exactly 10 lowercase alphanumeric characters
const MEETING_CODE_LENGTH = 10;
const MEETING_CODE_REGEX = /^[a-z0-9]{10}$/;

const generateMeetingCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < MEETING_CODE_LENGTH; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

function LandingPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [meetingCode, setMeetingCode] = useState('');
    const [showJoinInput, setShowJoinInput] = useState(false);

    const handleGetStarted = () => {
        if (token) {
            navigate("/home");
        } else {
            navigate("/auth");
        }
    };

    const handleStartMeeting = () => {
        const code = generateMeetingCode();
        navigate(`/${code}`);
    };

    const handleCodeChange = (e) => {
        const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
        setMeetingCode(cleaned);
    };

    const handleJoinMeeting = (e) => {
        e.preventDefault();
        if (MEETING_CODE_REGEX.test(meetingCode)) {
            navigate(`/${meetingCode}`);
        }
    };

    return (
        <div className='landingPageContainer'>
            <nav>
                <div className="navHeader">
                    <h2>ConferenceWorld</h2>
                </div>
                {!token ? (
                    <div className="navList">
                        <p onClick={() => navigate("/auth?mode=register")}>Register</p>
                        <div role='button'>
                            <p onClick={() => navigate("/auth?mode=login")}>Login</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Button
                            startIcon={<RestoreIcon />}
                            onClick={() => navigate("/history")}
                            sx={{ color: "var(--text-primary)", textTransform: "none", fontSize: "1rem" }}
                        >
                            <span className="nav-text">History</span>
                        </Button>
                        <Button
                            startIcon={<LogoutIcon sx={{ display: { xs: 'block', sm: 'none' } }} />}
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/auth");
                            }}
                            sx={{ color: "var(--text-primary)", textTransform: "none", fontSize: "1rem", minWidth: { xs: 'auto', sm: '64px' } }}
                        >
                            <span className="nav-text">Logout</span>
                        </Button>
                        <Button className="profile-btn" onClick={() => navigate("/Profile")} sx={{ minWidth: 'auto', padding: '6px' }}>
                            <PersonIcon className="profile" />
                        </Button>
                    </div>
                )}
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#ff9839" }}>Connect</span> with your loved ones</h1>
                    <p>Cover a distance with ConferenceWorld</p>

                    {/* Guest Actions - Only show when not logged in */}
                    {!token && (
                        <div className="guestActions">
                            {/* Start Meeting Button */}
                            <div
                                role='button'
                                onClick={handleStartMeeting}
                                className="primaryAction"
                            >
                                <VideoCallIcon sx={{ mr: 1 }} />
                                <p>Start Meeting</p>
                            </div>

                            {/* Join Meeting Section */}
                            {!showJoinInput ? (
                                <div
                                    role='button'
                                    onClick={() => setShowJoinInput(true)}
                                    className="secondaryAction"
                                >
                                    <LoginIcon sx={{ mr: 1 }} />
                                    <p>Join Meeting</p>
                                </div>
                            ) : (
                                <form onSubmit={handleJoinMeeting} className="joinForm">
                                    <input
                                        type="text"
                                        value={meetingCode}
                                        onChange={handleCodeChange}
                                        placeholder="Enter code"
                                        maxLength={MEETING_CODE_LENGTH}
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={meetingCode.length !== MEETING_CODE_LENGTH}
                                    >
                                        Join
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowJoinInput(false); setMeetingCode(''); }}
                                        className="cancelBtn"
                                    >
                                        ✕
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Logged in user - Get Started */}
                    {token && (
                        <div role='button' onClick={handleGetStarted}>
                            <p>Go to Home</p>
                        </div>
                    )}
                </div>
                <div>
                    <img src="mobile.png" alt="" />
                </div>
            </div>
        </div>
    );
}

export default LandingPage;

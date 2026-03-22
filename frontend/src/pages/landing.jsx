import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconButton, Button } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

// Meeting codes: exactly 10 lowercase alphanumeric characters
const MEETING_CODE_LENGTH = 10;

const generateMeetingCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < MEETING_CODE_LENGTH; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

function LandingPage() {
    const router = useNavigate();
    const token = localStorage.getItem("token");
    const handleGetStarted =() => {
        if(token) {
            router("/home");
        } else {
            router("/auth");
        }
    }

    const handleGuestJoin = () => {
        // Generate a unique meeting code for the guest
        const code = generateMeetingCode();
        router(`/${code}`);
    };

    let navigate = useNavigate();
    return ( 
        <div className='landingPageContainer'>
            <nav>
                <div className="navHeader">
                    <h2>ConferenceWorld</h2>
                </div>
                {!token ? <div className="navList">
                    <p onClick={handleGuestJoin}>Join as guest</p>
                    <p onClick={() => {
                        router("/auth?mode=register")
                    }}>Register</p>
                    <div role='button'>
                        <p onClick={() => {
                            router("/auth?mode=login")
                        }}>Login</p>
                    </div>
                </div> : <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
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
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }} 
                        sx={{ color: "var(--text-primary)", textTransform: "none", fontSize: "1rem", minWidth: { xs: 'auto', sm: '64px' } }}
                    >
                        <span className="nav-text">Logout</span>
                    </Button>
                    <Button className="profile-btn" onClick={() => navigate("/Profile")} sx={{ minWidth: 'auto', padding: '6px' }}>
                        <PersonIcon className="profile"/>        
                    </Button>
                </div>}
                
            </nav>
            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "#ff9839"}}>Connect</span> with your loved ones</h1>
                    <p>Cover a distance with ConferenceWorld</p>
                    <div role='button' onClick={handleGetStarted}>
                        <p style={{cursor: 'pointer'}}>Get Started</p>
                    </div>
                </div>
                <div>
                    <img src="mobile.png" alt="" />
                </div>
            </div>
        </div>
     );
}

export default LandingPage;
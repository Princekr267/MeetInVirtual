import { IconButton, Button } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";
import "../../styles/home.css"

function Navbar() {
    let navigate = useNavigate();
    return ( 
        <>
            <div className='navbar'>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <a href="/"><h2>ConferenceWorld</h2></a>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <IconButton onClick={() => navigate("/history")}>
                            <RestoreIcon sx={{ color: 'var(--text-primary)' }}/>
                            <p className="nav-text" style={{margin: 0, color: 'var(--text-primary)', marginLeft: '8px', fontSize: '1rem', fontWeight: 500}}>History</p>
                        </IconButton>
                    </div>
                    <Button 
                        variant="outlined"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                        sx={{
                            color: 'var(--text-primary)',
                            borderColor: 'var(--glass-border)',
                            borderRadius: '20px',
                            textTransform: 'none',
                            px: { xs: 1, sm: 3 },
                            minWidth: { xs: 'auto', sm: '64px' },
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.2)'
                            }
                        }}
                    >
                        <LogoutIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
                        <span className="nav-text">Logout</span>
                    </Button>
                    <Button className="profile-btn" onClick={() => navigate("/Profile")} sx={{ minWidth: 'auto', padding: '6px' }}>
                        <PersonIcon className="profile"/>        
                    </Button>
                </div>
                
            </div>
        </>
     );
}

export default Navbar;

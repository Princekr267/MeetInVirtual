import React from 'react';
import { useContext } from 'react';
import {AuthContext} from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import Home from '@mui/icons-material/Home'
import Navbar from './components/Navbar.jsx';
import "../styles/home.css"

export default function History(){

    const {getHistoryOfUser} = useContext(AuthContext);

    const [meetings, setMeetings] = useState([]);

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try{
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch(e){

            }
        }
        fetchHistory();
    }, [])


    return (
        <div>
            <Navbar/>
            <div className="historyWrapper" style={{ maxWidth: '100%', width: '90vw', margin: '0 auto', padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 0' }}>
                <IconButton onClick={() => routeTo("/home")} sx={{ color: 'var(--text-primary)'}}>
                    <Home fontSize='large'/>
                </IconButton>
                <Typography variant="h4" style={{ marginLeft: '10px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '30px' }}>Meeting History</Typography>
            </div>
            <div style={{ paddingBottom: '20px' }} className='history'>
            {
                meetings && meetings.length > 0 ? (
                    meetings.map((meeting, index) => (
                             <Box key={index} sx={{ minWidth: 275, marginBottom: 2 }}>
                                <Card variant="outlined" sx={{
                                    background: 'var(--bg-panel)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    color: 'var(--text-primary)',
                                    boxShadow: 'var(--glass-shadow)',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                                            Meeting Code: {meeting.meetingCode || meeting.meeting_code || 'N/A'}
                                        </Typography>
                                        <Typography sx={{ color: 'var(--text-secondary)', mb: 1.5, mt: 1 }}>
                                            Date: {meeting.date ? new Date(meeting.date).toLocaleString() : new Date(meeting.createdAt).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button 
                                            size="small" 
                                            onClick={() => routeTo(`/${meeting.meetingCode || meeting.meeting_code}`)}
                                            sx={{ 
                                                color: 'var(--accent-primary)', 
                                                fontWeight: 600,
                                                textTransform: 'none'
                                            }}
                                        >
                                            Join Again
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Box>
                    ))
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No meeting history found. Join a meeting to see it here!
                    </Typography>
                )
            }
            </div>
            </div>
        </div>
    )
}
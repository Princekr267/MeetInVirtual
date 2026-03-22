import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Button, TextField, Typography,
    CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const client = axios.create({ baseURL: 'http://localhost:3000/api/v1/users' });

// 3 steps: 0 = email, 1 = otp, 2 = new password
export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep]       = useState(0);
    const [email, setEmail]     = useState('');
    const [otp, setOtp]         = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');
    const otpRefs = useRef([]);

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            color: 'var(--text-primary)',
            '& fieldset': { borderColor: 'var(--glass-border)' },
            '&:hover fieldset': { borderColor: 'var(--text-secondary)' },
            '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
        },
        '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent-primary)' },
        '& .MuiFormHelperText-root': { color: '#ff4757' },
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return; // digits only
        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste.split(''));
            otpRefs.current[5]?.focus();
        }
        e.preventDefault();
    };

    // Step 0: send OTP
    const handleSendOtp = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setLoading(true); setError('');
        try {
            await client.post('/forgot-password/send-otp', { username: email });
            setSuccess('OTP sent! Check your inbox.');
            setTimeout(() => { setSuccess(''); setStep(1); }, 1200);
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: verify OTP
    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length < 6) { setError('Enter the full 6-digit OTP.'); return; }
        setLoading(true); setError('');
        try {
            await client.post('/forgot-password/verify-otp', { username: email, otp: code });
            setSuccess('OTP verified!');
            setTimeout(() => { setSuccess(''); setStep(2); }, 1000);
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: reset password
    const handleResetPassword = async () => {
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        setLoading(true); setError('');
        try {
            await client.post('/forgot-password/reset', { username: email, newPassword: password });
            setSuccess('Password reset! Redirecting to login...');
            setTimeout(() => navigate('/auth'), 2000);
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = ['Forgot password', 'Enter OTP', 'New password'];

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)',
        }}>
            <Box sx={{
                width: '100%', maxWidth: 420,
                background: 'var(--bg-panel)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                display: 'flex', flexDirection: 'column', gap: 2.5,
            }}>
                {/* Step indicator */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {[0, 1, 2].map(i => (
                        <Box key={i} sx={{
                            flex: 1, height: 4, borderRadius: 2,
                            background: i <= step
                                ? 'linear-gradient(135deg, #0088ff, #00dfc0)'
                                : 'var(--glass-border)',
                            transition: 'background 0.4s ease',
                        }} />
                    ))}
                </Box>

                <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {stepTitles[step]}
                </Typography>

                {/* ── Step 0: Email ───────────────────────────── */}
                {step === 0 && (
                    <>
                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Enter the email linked to your account. We'll send a 6-digit OTP.
                        </Typography>
                        <TextField
                            label="Email address"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                            sx={fieldSx}
                        />
                        {error && <Typography sx={{ color: '#ff4757', fontSize: '0.85rem' }}>{error}</Typography>}
                        {success && <Typography sx={{ color: '#4cd137', fontSize: '0.85rem' }}>{success}</Typography>}
                        <Button
                            variant="contained" fullWidth onClick={handleSendOtp}
                            disabled={loading}
                            sx={{
                                background: 'var(--accent-gradient)', fontWeight: 600,
                                py: 1.5, borderRadius: '12px', textTransform: 'none', fontSize: '1rem',
                            }}
                        >
                            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send OTP'}
                        </Button>
                    </>
                )}

                {/* ── Step 1: OTP boxes ───────────────────────── */}
                {step === 1 && (
                    <>
                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                        </Typography>

                        {/* OTP input boxes */}
                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', my: 1 }}>
                            {otp.map((digit, i) => (
                                <Box
                                    key={i}
                                    component="input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    ref={el => otpRefs.current[i] = el}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    onPaste={handleOtpPaste}
                                    sx={{
                                        width: 52, height: 60,
                                        textAlign: 'center',
                                        fontSize: '1.6rem', fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: digit
                                            ? '2px solid var(--accent-primary)'
                                            : '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        outline: 'none',
                                        caretColor: 'var(--accent-primary)',
                                        transition: 'border 0.2s',
                                        '&:focus': { border: '2px solid var(--accent-primary)' },
                                    }}
                                />
                            ))}
                        </Box>

                        {error && <Typography sx={{ color: '#ff4757', fontSize: '0.85rem', textAlign: 'center' }}>{error}</Typography>}
                        {success && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4cd137' }}>
                                <CheckCircleIcon fontSize="small" />
                                <Typography sx={{ fontSize: '0.85rem' }}>{success}</Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained" fullWidth onClick={handleVerifyOtp}
                            disabled={loading || otp.join('').length < 6}
                            sx={{
                                background: 'var(--accent-gradient)', fontWeight: 600,
                                py: 1.5, borderRadius: '12px', textTransform: 'none', fontSize: '1rem',
                            }}
                        >
                            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify OTP'}
                        </Button>

                        <Button
                            onClick={() => { setStep(0); setOtp(['','','','','','']); setError(''); }}
                            sx={{ color: 'var(--text-secondary)', textTransform: 'none', fontSize: '0.9rem' }}
                        >
                            Wrong email? Go back
                        </Button>

                        {/* Resend OTP */}
                        <ResendOtp email={email} client={client} />
                    </>
                )}

                {/* ── Step 2: New Password ────────────────────── */}
                {step === 2 && (
                    <>
                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Choose a strong new password for your account.
                        </Typography>
                        <TextField
                            label="New password"
                            type={showPass ? 'text' : 'password'}
                            fullWidth
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            helperText={password && password.length < 6 ? 'Minimum 6 characters' : ''}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPass(p => !p)} sx={{ color: 'var(--text-secondary)' }}>
                                            {showPass ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={fieldSx}
                        />
                        <TextField
                            label="Confirm password"
                            type={showPass ? 'text' : 'password'}
                            fullWidth
                            value={confirm}
                            onChange={e => { setConfirm(e.target.value); setError(''); }}
                            helperText={confirm && confirm !== password ? 'Passwords do not match' : ''}
                            sx={fieldSx}
                        />
                        {error && <Typography sx={{ color: '#ff4757', fontSize: '0.85rem' }}>{error}</Typography>}
                        {success && <Typography sx={{ color: '#4cd137', fontSize: '0.85rem' }}>{success}</Typography>}
                        <Button
                            variant="contained" fullWidth onClick={handleResetPassword}
                            disabled={loading}
                            sx={{
                                background: 'var(--accent-gradient)', fontWeight: 600,
                                py: 1.5, borderRadius: '12px', textTransform: 'none', fontSize: '1rem',
                            }}
                        >
                            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Reset Password'}
                        </Button>
                    </>
                )}

                <Button
                    onClick={() => navigate('/auth')}
                    sx={{ color: 'var(--text-secondary)', textTransform: 'none', alignSelf: 'center' }}
                >
                    Back to login
                </Button>
            </Box>
        </Box>
    );
}

// Resend OTP with 60s cooldown
function ResendOtp({ email, client }) {
    const [cooldown, setCooldown] = useState(0);
    const [msg, setMsg] = useState('');

    const handleResend = async () => {
        if (cooldown > 0) return;
        try {
            await client.post('/forgot-password/send-otp', { username: email });
            setMsg('New OTP sent!');
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown(c => {
                    if (c <= 1) { clearInterval(timer); return 0; }
                    return c - 1;
                });
            }, 1000);
            setTimeout(() => setMsg(''), 3000);
        } catch {
            setMsg('Failed to resend.');
        }
    };

    return (
        <Box sx={{ textAlign: 'center' }}>
            {msg && <Typography sx={{ color: '#4cd137', fontSize: '0.8rem', mb: 0.5 }}>{msg}</Typography>}
            <Button
                onClick={handleResend}
                disabled={cooldown > 0}
                sx={{ color: 'var(--text-secondary)', textTransform: 'none', fontSize: '0.85rem' }}
            >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Didn't get the code? Resend"}
            </Button>
        </Box>
    );
}
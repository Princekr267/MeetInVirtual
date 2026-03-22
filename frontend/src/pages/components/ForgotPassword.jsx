import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/users';

function ForgotPassword({ open, handleClose }) {
  const [step, setStep] = React.useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const resetState = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleDialogClose = () => {
    resetState();
    handleClose();
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/forgot-password/send-otp`, { username: email });
      setSuccess(res.data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/forgot-password/verify-otp`, { username: email, otp });
      setSuccess(res.data.message || 'OTP verified successfully.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/forgot-password/reset`, { username: email, newPassword });
      setSuccess(res.data.message || 'Password reset successfully!');
      setTimeout(() => {
        handleDialogClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (step) {
      case 1: return 'Reset Password';
      case 2: return 'Enter OTP';
      case 3: return 'New Password';
      default: return 'Reset Password';
    }
  };

  const getDescription = () => {
    switch (step) {
      case 1: return "Enter your email address and we'll send you a 6-digit OTP.";
      case 2: return `Enter the OTP sent to ${email}`;
      case 3: return 'Enter your new password.';
      default: return '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { backgroundImage: 'none' } },
      }}
    >
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <DialogContentText>{getDescription()}</DialogContentText>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <TextField
              autoFocus
              required
              fullWidth
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mt: 1 }}
            />
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </DialogActions>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <TextField
              autoFocus
              required
              fullWidth
              id="otp"
              label="6-Digit OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              inputProps={{ maxLength: 6 }}
              sx={{ mt: 1 }}
            />
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={() => setStep(1)} disabled={loading}>Back</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
            </DialogActions>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <TextField
              autoFocus
              required
              fullWidth
              id="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              sx={{ mt: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        border: 'none',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                        '&:hover': { backgroundColor: 'transparent' },
                        color: 'text.secondary',
                      }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              sx={{ mt: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{
                        border: 'none',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                        '&:hover': { backgroundColor: 'transparent' },
                        color: 'text.secondary',
                      }}
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={() => setStep(2)} disabled={loading}>Back</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import { useSearchParams } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from './CustomIcons';
import { AuthContext } from '../../context/AuthContext';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    margin: 'auto',
    width: '90vw',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [fullNameError, setFullNameError] = React.useState(false);
  const [fullNameErrorMessage, setFullNameErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [formState, setFormState] = React.useState(mode === 'register' ? 1 : 0); // 0 for sign in, 1 for sign up
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const {handleRegister, handleLogin} = React.useContext(AuthContext);
  
  const handleAuth = async () => {
    try {
      // Get values from form inputs
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      if (formState === 0) {
        // Sign in
        let result = await handleLogin(email, password);
        console.log(result);
        setMessage('Login successful!');
      }
      
      if (formState === 1) {
        // Sign up
        const fullName = document.getElementById('fullName').value;
        let result = await handleRegister(fullName, email, password);
        console.log(result);
        setMessage(result);
        setFormState(0);
      }
    } catch (err) {
      let message = err?.response?.data?.message || "An error occurred";
      setError(message);
      console.error(err);
    }
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Clear previous messages
    setError('');
    setMessage('');
    
    if (!validateInputs()) {
      return;
    }
    
    // Now call handleAuth
    handleAuth();
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let isValid = true;

    if (formState === 1) {
      const fullname = document.getElementById('fullName');
      if (!fullname || !fullname.value) {
        setFullNameError(true);
        setFullNameErrorMessage("Please enter your name");
        isValid = false;
      } else {
        setFullNameError(false);
        setFullNameErrorMessage('');
      }
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <Card variant="outlined">
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
      >
        {formState === 1 ? 'Sign up' : 'Sign in'}
      </Typography>
      
      {/* Display error/success messages */}
      {error && (
        <Typography color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      {message && (
        <Typography color="success.main" sx={{ textAlign: 'center' }}>
          {message}
        </Typography>
      )}
      
      <Box
        component="form"
        onSubmit={handleSubmit}  // Use onSubmit on the form
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
      >
        <>
          {formState === 1 && (
            <FormControl>
              <FormLabel htmlFor="fullName">Full Name</FormLabel>
              <TextField
                error={fullNameError}
                helperText={fullNameErrorMessage}
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={fullNameError ? 'error' : 'primary'}
              />
            </FormControl>
          )}
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoFocus={formState === 0}
              required
              fullWidth
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
            />
          </FormControl>
        </>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            {formState === 0 && (
              <Link
                component="button"
                type="button"
                onClick={handleClickOpen}
                variant="body2"
                sx={{ alignSelf: 'baseline' }}
              >
                Forgot your password?
              </Link>
            )}
          </Box>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoFocus={false}
            required
            fullWidth
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
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
        </FormControl>
        <ForgotPassword open={open} handleClose={handleClose} />
        <Button type="submit" fullWidth variant="contained">
          {formState === 1 ? 'Sign up' : 'Sign in'}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={() => window.location.href = "http://localhost:3000/api/v1/users/auth/google"}
          sx={{ mt: 1 }}
        >
          Continue with Google
        </Button>
        <Typography sx={{ textAlign: 'center' }}>
          {formState === 1 ? "Already have an account? " : "Don't have an account? "}
          <span>
            <Link
              component="button"
              type="button"
              variant="body2"
              sx={{ alignSelf: 'center' }}
              onClick={() => {
                setFormState(formState === 1 ? 0 : 1);
                setError('');
                setMessage('');
              }}
            >
              {formState === 1 ? 'Sign in' : 'Sign up'}
            </Link>
          </span>
        </Typography>
      </Box>
    </Card>
  );
}
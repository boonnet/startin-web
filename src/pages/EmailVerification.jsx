import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Link
} from '@mui/material';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import Navbar from '../components/Navbar';
// import loginbg from '../../assets/loginbg.png';
// import Loginsvg from '../../assets/loginsvg.png';
import Loginsvg from '../assets/loginsvg.png';
import loginbg from '../assets/loginbg.png';

const EmailVerification = () => {
  // Form state
  const [email, setEmail] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulated email verification API call
      const response = await axios.post(`${baseurl}/api/forgot-password`, {
        email: email
      });

      // Assuming the API returns a success response
      if (response.data && response.data.message) {
        setSuccess(true);

        // Redirect or show next steps after verification
        setTimeout(() => {
          window.location.href = '/new'; // Change to your app's verification page
        }, 2000);
      } else {
        setError('Email verification failed. Please try again.');
      }

    } catch (error) {
      console.error('Email verification error:', error);
      setError(error.response?.data?.message || 'Email verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError('');
  };

  return (
    <>
      <Navbar transparent={true} />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          backgroundImage: `url(${loginbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            minHeight: '100vh',
            px: {
              xs: 2,
              sm: 3,
              md: 4
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: { xs: 2, md: 4 },
              minHeight: '100vh',
              flexDirection: { xs: 'column', md: 'row' },
              py: { xs: 4, md: 0 }
            }}
          >
            {/* Left side illustration - hide on mobile */}
            <Box
              sx={{
                flex: 1,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src={Loginsvg}
                alt="Email Verification illustration"
                sx={{
                  width: '100%',
                  maxWidth: { md: 350, lg: 400 },
                  height: 'auto'
                }}
              />
            </Box>

            {/* Email Verification form container */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                flex: { xs: '1', md: '0 1 450px' },
                maxWidth: '100%',
                p: { xs: 3, sm: 4 },
                backgroundImage: `url(${loginbg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                mt: { xs: 2, md: 0 }
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  textAlign: { xs: 'center', sm: 'left' },
                  fontWeight: 600
                }}
              >
                Verify Your Email
              </Typography>

              <Typography 
                color="text.secondary" 
                sx={{ 
                  mb: 3, 
                  textAlign: { xs: 'center', sm: 'left' } 
                }}
              >
                Enter the email address associated with your account
              </Typography>

              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={handleEmailChange}
                required
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '& .MuiOutlinedInput-root': {
                    height: { xs: '48px', sm: '56px' }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  py: { xs: 1.2, sm: 1.5 },
                  backgroundColor: '#0045FF',
                  '&:hover': {
                    backgroundColor: '#0039CC',
                  },
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  position: 'relative'
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        color: 'white',
                        position: 'absolute',
                        left: 'calc(50% - 12px)'
                      }}
                    />
                    <span style={{ visibility: 'hidden' }}>Send Verification</span>
                  </>
                ) : 'Send Verification Email'}
              </Button>

              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3,
                gap: 1
              }}>
                <Typography color="text.secondary">
                  Already verified?
                </Typography>
                <Link href="/login" color="primary" underline="none">
                  Back to Login
                </Link>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Error notification */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        {/* Success notification */}
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Verification email sent! Redirecting...
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default EmailVerification;
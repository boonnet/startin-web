import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import googleicon from '../../assets/logos_google-icon.png';
import facebookicon from '../../assets/Vector.png';
import Loginsvg from '../../assets/loginsvg.png';
import loginbg from '../../assets/loginbg.png';
import axios from 'axios';
import baseurl from '../../ApiService/ApiService';
import Navbar from '../Navbar';

const Login = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the login API
      const response = await axios.post(`${baseurl}/api/user/login`, {
        email: formData.email,
        password: formData.password
      });

      // Store token in localStorage for future authenticated requests
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);

        // Get user details after successful login
        try {
          // Decode token to get user ID (assuming token contains uid)
          const tokenData = JSON.parse(atob(response.data.token.split('.')[1]));
          const userId = tokenData.uid;

          // Fetch user details including profile image
          const userResponse = await axios.get(`${baseurl}/api/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`
            }
          });

          // Store user info in localStorage
          if (userResponse.data) {
            localStorage.setItem('userInfo', JSON.stringify({
              id: userResponse.data.id || userId,
              username: userResponse.data.username || '',
              email: userResponse.data.email || formData.email,
              profile_image: userResponse.data.profile_image || ''
            }));
          }
        } catch (userError) {
          console.error('Error fetching user details:', userError);
          // Still store basic info if user details fetch fails
          localStorage.setItem('userInfo', JSON.stringify({
            email: formData.email
          }));
        }

        setSuccess(true);

        // Redirect to dashboard or home page after successful login
        setTimeout(() => {
          window.location.href = '/'; // Change to your app's main page after login
        }, 1000);
      } else {
        setError('Login failed. Invalid response from server.');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
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
                alt="Login illustration"
                sx={{
                  width: '100%',
                  maxWidth: { md: 350, lg: 400 },
                  height: 'auto'
                }}
              />
            </Box>

            {/* Login form container */}
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
                Login to your Account
              </Typography>

              <Box sx={{
                display: 'flex',
                gap: 1,
                mb: 3,
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                <Typography color="text.secondary">
                  Don't have an account?
                </Typography>
                <Link href="/register" color="primary" underline="none">
                  Sign Up!
                </Link>
              </Box>

              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                variant="outlined"
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '& .MuiOutlinedInput-root': {
                    height: { xs: '48px', sm: '56px' }
                  }
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '& .MuiOutlinedInput-root': {
                    height: { xs: '48px', sm: '56px' }
                  }
                }}
              />

              <Box sx={{
                textAlign: 'right',
                mt: 1,
                mb: 3
              }}>
                <Link href="/email-verification" color="primary" underline="none">
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
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
                    <span style={{ visibility: 'hidden' }}>Login</span>
                  </>
                ) : 'Login'}
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  my: 3
                }}
              >
                <Divider sx={{ flex: 1 }} />
                <Typography color="text.secondary">Or</Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: { xs: 3, sm: 2 }
                }}
              >
                <IconButton
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 }
                  }}
                >
                  <img src={googleicon} alt="Login with Google" style={{ width: '60%', height: '60%' }} />
                </IconButton>
                <IconButton
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 }
                  }}
                >
                  <img src={facebookicon} alt="Login with Facebook" style={{ width: '60%', height: '60%' }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Success and Error notifications */}
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

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Login successful! Redirecting...
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Login;
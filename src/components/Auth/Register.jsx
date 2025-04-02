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
  useMediaQuery,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import googleicon from '../../assets/logos_google-icon.png';
import facebookicon from '../../assets/Vector.png';
import Loginsvg from '../../assets/loginsvg.png';
import loginbg from '../../assets/loginbg.png';
import axios from 'axios';
import baseurl from '../../ApiService/ApiService'

const Register = () => {
  const isTablet = useMediaQuery('(min-width:426px) and (max-width:768px)');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const username = formData.fullName.split(' ')[0].toLowerCase();
      
      // Prepare data for API
      const userData = {
        username: username,
        email: formData.email,
        password: formData.password,
        phone: '' // If you want to add phone field later
      };
      
      // Make API call
      const response = await axios.post(`${baseurl}/api/user/register`, userData);
      
      // Handle successful registration
      setNotification({
        open: true,
        message: 'Account created successfully! Redirecting to login...',
        severity: 'success'
      });
      
      // Redirect to login page after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      // Handle error
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
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
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
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
            justifyContent: 'center', 
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
              alt="Registration illustration"
              sx={{
                width: '100%',
                maxWidth: { md: 350, lg: 400 },
                height: 'auto'
              }}
            />
          </Box>

          {/* Registration form container */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              flex: { xs: '1', md: '0 1 450px' },
              width: {
                sm: isTablet ? '70%' : '100%', 
                md: '450px'
              },
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
              Create your Account
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              mb: 3,
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <Typography color="text.secondary">
                Already have an account?
              </Typography>
              <Link href="/login" color="primary" underline="none">
                Login here
              </Link>
            </Box>

            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              error={!!errors.fullName}
              helperText={errors.fullName}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '& .MuiOutlinedInput-root': {
                  height: { xs: '48px', sm: '56px' }
                }
              }}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '& .MuiOutlinedInput-root': {
                  height: { xs: '48px', sm: '56px' }
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              mt: 1, 
              mb: 3,
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Typography variant="caption" color="text.secondary">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                borderRadius: 2,
                py: { xs: 1.2, sm: 1.5 },
                backgroundColor: '#0045FF',
                '&:hover': {
                  backgroundColor: '#0039CC',
                },
                textTransform: 'none',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
                <img src={googleicon} alt="Register with Google" style={{ width: '60%', height: '60%' }} />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' },
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 }
                }}
              >
                <img src={facebookicon} alt="Register with Facebook" style={{ width: '60%', height: '60%' }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
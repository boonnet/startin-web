import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import loginbg from '../assets/loginbg.png';
import Loginsvg from '../assets/loginsvg.png';
import Navbar from '../components/Navbar';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';

const CreateNewPassword = () => {
  // Form state
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Toggle password visibility
  const handleToggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.token) {
        setError('Please enter the reset token');
        return;
    }

    if (!formData.newPassword) {
        setError('Please enter a new password');
        return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    setLoading(true);
    setError('');

    try {
        // Call the reset password API
        const response = await axios.post(`${baseurl}/api/reset-password`, {
            token: formData.token,
            newpassword: formData.newPassword // Corrected key
        });

        setSuccess(true);

        // Redirect to login page after successful password reset
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);

    } catch (error) {
        console.error('Password reset error:', error);
        setError(error.response?.data?.message || 'Password reset failed. Please try again.');
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
                alt="Reset Password illustration"
                sx={{
                  width: '100%',
                  maxWidth: { md: 350, lg: 400 },
                  height: 'auto'
                }}
              />
            </Box>

            {/* Reset Password form container */}
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
                Create New Password
              </Typography>

              <Typography 
                color="text.secondary" 
                sx={{ 
                  mb: 3, 
                  textAlign: { xs: 'center', sm: 'left' } 
                }}
              >
                Enter your reset token and create a new password
              </Typography>

              <TextField
                fullWidth
                name="token"
                label="Reset Token"
                variant="outlined"
                margin="normal"
                value={formData.token}
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
                name="newPassword"
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={formData.newPassword}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle new password visibility"
                        onClick={handleToggleNewPasswordVisibility}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
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
                    <span style={{ visibility: 'hidden' }}>Reset Password</span>
                  </>
                ) : 'Reset Password'}
              </Button>

              <Box sx={{
                textAlign: 'center',
                mt: 2
              }}>
                <Link href="/login" color="primary" underline="none">
                  Back to Login
                </Link>
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
            Password reset successful! Redirecting to login...
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default CreateNewPassword;
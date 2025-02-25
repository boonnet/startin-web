import React from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import googleicon from '../../assets/logos_google-icon.png';
import facebookicon from '../../assets/Vector.png';
import Loginsvg from '../../assets/loginsvg.png';
import loginbg from '../../assets/loginbg.png';

const Login = () => {
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
                fontWeight:600
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
              label="Email Address"
              variant="outlined"
              margin="normal"
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
              type="password"
              variant="outlined"
              margin="normal"
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
              <Link href="#" color="primary" underline="none">
                Forgot Password?
              </Link>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
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
              Login
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
    </Box>
  );
};

export default Login;
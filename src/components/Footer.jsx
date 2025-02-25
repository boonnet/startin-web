import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Container, Grid, Typography, IconButton, Link, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer = React.memo(() => {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Fetch logo from backend
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/logo', {
          responseType: 'blob'  // Get response as blob for image
        });
        
        // Convert blob to URL
        const logoUrl = URL.createObjectURL(response.data);
        setLogo(logoUrl);
        setError(null);
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError('Failed to load logo');
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();

    // Cleanup function to revoke object URL
    return () => {
      if (logo) {
        URL.revokeObjectURL(logo);
      }
    };
  }, []);

  const quickLinks = [
    { text: 'Home', href: '/' },
    { text: 'Courses', href: '/courses' },
    { text: 'About', href: '/about' },
    { text: 'Contact', href: '/contact' },
    { text: 'Blog', href: '/blog' }
  ];

  const courses = [
    { text: 'Business', href: '/courses/business' },
    { text: 'Technology', href: '/courses/technology' },
    { text: 'Finance', href: '/courses/finance' }
  ];

  const socialIcons = [
    { Icon: InstagramIcon, href: '#', color: '#00ffdd' },
    { Icon: TwitterIcon, href: '#', color: '#00ffdd' },
    { Icon: FacebookIcon, href: '#', color: '#00ffdd' },
    { Icon: LinkedInIcon, href: '#', color: '#00ffdd' }
  ];

  const contactInfo = [
    { 
      icon: <PhoneIcon sx={{ color: '#00ffdd' }} />,
      text: '+91 98765 43210',
      href: 'tel:+919876543210'
    },
    {
      icon: <EmailIcon sx={{ color: '#00ffdd' }} />,
      text: 'example@email.com',
      href: 'mailto:example@email.com'
    },
    {
      icon: <LocationOnIcon sx={{ color: '#00ffdd' }} />,
      text: 'Tamil Nadu, India',
      href: '#'
    }
  ];

  const renderLogo = () => {
    if (loading) {
      return (
        <Box 
          sx={{ 
            width: { xs: 120, sm: 150 }, 
            height: { xs: 48, sm: 60 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            mb: { xs: 1.5, sm: 2 }
          }}
        >
          <CircularProgress size={24} sx={{ color: '#00ffdd' }} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box 
          sx={{ 
            width: { xs: 120, sm: 150 }, 
            height: { xs: 48, sm: 60 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            mb: { xs: 1.5, sm: 2 }
          }}
        >
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        </Box>
      );
    }

    return (
      <Box 
        component="img"
        src={logo}
        alt="Logo"
        sx={{ 
          width: { xs: 120, sm: 150 }, 
          height: { xs: 48, sm: 60 }, 
          bgcolor: 'white', 
          mb: { xs: 1.5, sm: 2 },
          objectFit: 'contain'
        }}
      />
    );
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: '#1b1e2b', 
        color: 'white', 
        mt: 'auto', 
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 0 }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {/* Logo and Description */}
          <Grid item xs={12} sm={6} md={3}>
            {renderLogo()}
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Connect with Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialIcons.map(({ Icon, href, color }, index) => (
                <IconButton
                  key={index}
                  href={href}
                  sx={{ 
                    color: color,
                    p: { xs: 1, sm: 1.5 },
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                >
                  <Icon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.75, sm: 1 } }}>
              {quickLinks.map((link, index) => (
                <Typography 
                  key={index} 
                  component={Link}
                  href={link.href}
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&:hover': { color: '#00ffdd' }
                  }}
                >
                  {link.text}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Courses */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Courses
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.75, sm: 1 } }}>
              {courses.map((course, index) => (
                <Typography
                  key={index}
                  component={Link}
                  href={course.href}
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&:hover': { color: '#00ffdd' }
                  }}
                >
                  {course.text}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
              {contactInfo.map((info, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {React.cloneElement(info.icon, {
                      sx: { ...info.icon.props.sx, fontSize: { xs: '1.25rem', sm: '1.5rem' } }
                    })}
                  </Box>
                  <Typography
                    component={Link}
                    href={info.href}
                    sx={{
                      ml: 1,
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      '&:hover': { color: '#00ffdd' }
                    }}
                  >
                    {info.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            mt: { xs: 3, sm: 4 },
            pt: { xs: 1.5, sm: 2 },
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: { xs: 1.5, sm: 0 }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: { xs: 'center', sm: 'left' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            ©2025. All Rights Reserved.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: { xs: 1.5, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' }
            }}
          >
            <Link 
              href="/terms" 
              sx={{ 
                color: 'white', 
                textDecoration: 'none',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': { color: '#00ffdd' }
              }}
            >
              Terms & Conditions
            </Link>
            <Link 
              href="/privacy" 
              sx={{ 
                color: 'white', 
                textDecoration: 'none',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': { color: '#00ffdd' }
              }}
            >
              Privacy Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
});

Footer.displayName = 'Footer';

export default Footer;
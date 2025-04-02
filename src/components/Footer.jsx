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
import baseurl from '../ApiService/ApiService'; // Import your API base URL
import {useNavigate } from 'react-router-dom';

const Footer = React.memo(() => {
  const [logo, setLogo] = useState(null);
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Fetch settings including logo from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseurl}/api/settings/1`);
        
        if (response.data && response.data.site_logo) {
          // Store full settings data
          setSettings(response.data);
          // Create full URL for the logo
          setLogo(`${baseurl}/${response.data.site_logo}`);
          setError(null);
        } else {
          setError('Logo not found in response');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const quickLinks = [
    { text: 'Home', href: '/' },
    { text: 'Courses', href: '/courses' },
    { text: 'About', href: '/WhoWeAre' },
    { text: 'Contact', href: '/ContactUs' },
    // { text: 'Blog', href: '/blog' }
  ];

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseurl}/api/category/all`);
      setCategories(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Use social links from API if available
  const socialIcons = [
    { 
      Icon: InstagramIcon, 
      href: settings?.instagram_url || '#', 
      color: '#00ffdd' 
    },
    { 
      Icon: TwitterIcon, 
      href: settings?.twitter_url || '#', 
      color: '#00ffdd' 
    },
    { 
      Icon: FacebookIcon, 
      href: settings?.facebook_url || '#', 
      color: '#00ffdd' 
    },
    { 
      Icon: LinkedInIcon, 
      href: settings?.linkedin_url || '#', 
      color: '#00ffdd' 
    }
  ];

  // Use contact info from API if available
  const contactInfo = [
    { 
      icon: <PhoneIcon sx={{ color: '#00ffdd' }} />,
      text: settings?.contact_no || '+91 98765 43210',
      href: `tel:${settings?.contact_no || '+919876543210'}`
    },
    {
      icon: <EmailIcon sx={{ color: '#00ffdd' }} />,
      text: settings?.contact_mail || 'example@email.com',
      href: `mailto:${settings?.contact_mail || 'example@email.com'}`
    },
    {
      icon: <LocationOnIcon sx={{ color: '#00ffdd' }} />,
      text: 'Tamil Nadu, India',
      href: settings?.location_url || '#'
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
        alt={settings?.site_name || "Logo"}
        sx={{ 
          width: { xs: 120, sm: 150 }, 
          height: { xs: 48, sm: 60 }, 
          background: 'transparent', 
          mb: { xs: 1.5, sm: 2 },
          objectFit: 'contain'
        }}
        onClick={() => navigate('/')}
      />
    );
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'rgba(29, 37, 65, 1)', 
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
              {settings?.site_description || "Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc"}
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
              {categories.map((course, index) => (
                <Typography
                  key={index}
                  component={Link}
                  href='/Courses'
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&:hover': { color: '#00ffdd' }
                  }}
                >
                  {course.category_name}
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
            ©2025. All Rights Reserved. {settings?.site_name ? `${settings.site_name}` : ''}
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
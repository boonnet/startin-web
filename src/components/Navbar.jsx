import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { CircleUserRound } from 'lucide-react';

// Logo component remains unchanged as it gets data from backend
const Logo = memo(() => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get('/api/logo', {
          responseType: 'blob'
        });
        const imageUrl = URL.createObjectURL(response.data);
        setLogoUrl(imageUrl);
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError(true);
      }
    };

    fetchLogo();

    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, []);

  if (error || !logoUrl) {
    return (
      <Box
        sx={{
          width: 120,
          height: 50,
          bgcolor: '#D3D3D3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography sx={{ fontFamily: 'Poppins' }}>
          {error ? 'Logo Error' : 'Loading...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={logoUrl}
      alt="Company Logo"
      sx={{
        width: 120,
        height: 50,
        objectFit: 'contain'
      }}
    />
  );
});

Logo.displayName = 'Logo';

// Optimized NavButton with Link integration
const NavButton = memo(({ to, children, isActive }) => (
  <Link 
    to={to} 
    style={{ textDecoration: 'none' }}
  >
    <Button
      sx={{
        fontFamily: 'Poppins',
        textTransform: 'none',
        color: isActive ? '#0000FF' : '#000000',
        px: 2,
        py: 1,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: isActive ? '100%' : '0%',
          height: '2px',
          bgcolor: '#0000FF',
          transition: 'width 0.3s ease'
        },
        '&:hover': {
          color: '#0000FF',
          bgcolor: 'transparent',
          '&::after': {
            width: '100%'
          }
        }
      }}
    >
      {children}
    </Button>
  </Link>
));

NavButton.displayName = 'NavButton';

// Optimized LoginButton with Link
const LoginButton = memo(() => (
  <Link to="/login" style={{ textDecoration: 'none' }}>
    <Button
      variant="outlined"
      sx={{
        fontFamily: 'Poppins',
        textTransform: 'none',
        border: '1px solid #000000',
        borderRadius: '20px',
        px: 2.5,
        py: 0.6,
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '&:hover': {
          bgcolor: '#f5f5f5',
          borderColor: '#000000'
        }
      }}
    >
      <CircleUserRound size={20} />
      Login
    </Button>
  </Link>
));

LoginButton.displayName = 'LoginButton';

// Optimized DrawerContent with navigation
const DrawerContent = memo(({ onClose, navItems, currentPath }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
      <Link to="/">
        <Logo />
      </Link>
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>
    <List sx={{ pt: 2.5 }}>
      {navItems.map(({ name, path }) => (
        <ListItem
          key={path}
          component={Link}
          to={path}
          onClick={onClose}
          sx={{
            fontFamily: 'Poppins',
            px: 3,
            py: 1.8,
            color: currentPath === path ? '#0000FF' : '#000000',
            bgcolor: currentPath === path ? '#f0f0f0' : 'transparent',
            textDecoration: 'none',
            '&:hover': {
              bgcolor: '#f5f5f5',
              color: '#0000FF'
            }
          }}
        >
          <Typography sx={{ fontFamily: 'Poppins' }}>{name}</Typography>
        </ListItem>
      ))}
      <ListItem sx={{ px: 3, py: 1.8 }}>
        <LoginButton />
      </ListItem>
    </List>
  </Box>
));

DrawerContent.displayName = 'DrawerContent';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation();

  const navItems = useMemo(() => [
    { name: 'Home', path: '/' },
    { name: 'Who we are', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Contact Us', path: '/contact' }
  ], []);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  return (
    <>
      <AppBar
        position="static"
        sx={{
          bgcolor: 'white',
          boxShadow: 'none',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link to="/">
            <Logo />
          </Link>
          
          {isMobile ? (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ color: 'black' }}
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {navItems.map(({ name, path }) => (
                <NavButton 
                  key={path}
                  to={path}
                >
                  {name}
                </NavButton>
              ))}
              <LoginButton />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: 250,
            bgcolor: 'white'
          },
        }}
      >
        <DrawerContent 
          onClose={handleDrawerToggle} 
          navItems={navItems}
          currentPath={location.pathname}
        />
      </Drawer>
    </>
  );
};

export default memo(Navbar);
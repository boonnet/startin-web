// Navbar.js

import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { CircleUser , LogOut } from 'lucide-react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import MenuList from '@mui/material/MenuList';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import baseurl from '../ApiService/ApiService';

// Logo component remains unchanged as it gets data from backend
const Logo = memo(() => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/settings/1`);
        // Use site_logo from the response data
        if (response.data && response.data.site_logo) {
          setLogoUrl(`${baseurl}/${response.data.site_logo}`);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError(true);
      }
    };

    fetchLogo();
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
        objectFit: 'contain',
        background: 'transparent'
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
        fontSize: '16px',
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
      <CircleUser  size={20} />
      Login
    </Button>
  </Link>
));

LoginButton.displayName = 'LoginButton';

// LogoutConfirmationDialog component
const LogoutConfirmationDialog = memo(({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '10px',
          width: '100%',
          maxWidth: '400px'
        }
      }}
    >
      <DialogTitle 
        id="logout-dialog-title"
        sx={{ 
          fontFamily: 'Poppins', 
          fontWeight: 600,
          pb: 1
        }}
      >
        Confirm Logout
      </DialogTitle>
      <DialogContent>
        <DialogContentText 
          id="logout-dialog-description"
          sx={{ 
            fontFamily: 'Poppins',
            color: 'text.primary'
          }}
        >
          Are you sure you want to log out of your account?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            fontFamily: 'Poppins',
            textTransform: 'none',
            borderRadius: '8px',
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            fontFamily: 'Poppins',
            textTransform: 'none',
            borderRadius: '8px',
            px: 3,
            ml: 2
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
});

LogoutConfirmationDialog.displayName = 'LogoutConfirmationDialog';

// Updated UserProfileButton component with proper profile image handling
const UserProfileButton = memo(({ userInfo, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const anchorRef = React.useRef(null);
  const navigate = useNavigate();

  // Get full profile image URL
  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return null;
    // Check if the URL already has the baseurl
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    return `${baseurl}/${profileImage}`;
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleNavigate = (path) => (event) => {
    handleClose(event);
    navigate(path);
  };

  const handleLogoutClick = () => {
    setOpen(false);
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    onLogout();
  };

  const profileImageUrl = getProfileImageUrl(userInfo?.profile_image);

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        aria-controls={open ? 'profile-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        sx={{
          p: 0.5,
          border: '1px solid #e0e0e0',
          borderRadius: '50%',
          '&:hover': {
            bgcolor: '#f5f5f5'
          }
        }}
      >
        {profileImageUrl ? (
          <Avatar 
            src={profileImageUrl}
            alt={userInfo.username || "User   "}
            sx={{ width: 36, height: 36 }}
          />
        ) : (
          <CircleUser  size={36} />
        )}
      </IconButton>
      
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        transition
        disablePortal
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'right bottom',
            }}
          >
            <Paper 
              elevation={3}
              sx={{ 
                borderRadius: '8px',
                width: 200,
                overflow: 'hidden',
                mt: 1
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    {profileImageUrl ? (
                      <Avatar 
                        src={profileImageUrl}
                        alt={userInfo.username || "User   "}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <CircleUser  size={40} />
                    )}
                    <Typography variant="subtitle1" fontWeight={500}>
                      {userInfo?.username || userInfo?.firstName || "User   "}
                    </Typography>
                  </Box>
                  <MenuList
                    autoFocusItem={open}
                    id="profile-menu"
                    aria-labelledby="profile-button"
                    onKeyDown={handleListKeyDown}
                    sx={{ py: 0 }}
                  >
                    <MenuItem 
                      onClick={handleNavigate('/dashboard/profile')}
                      sx={{ 
                        py: 1.5, 
                        px: 2,
                        borderBottom: '1px solid #f5f5f5'
                      }}
                    >
                      <Typography fontSize={15}>Profile</Typography>
                    </MenuItem>
                    <MenuItem 
                      onClick={handleNavigate('/dashboard')}
                      sx={{ 
                        py: 1.5, 
                        px: 2,
                        borderBottom: '1px solid #f5f5f5'
                      }}
                    >
                      <Typography fontSize={15}>Dashboard</Typography>
                    </MenuItem>
                    <MenuItem 
                      onClick={handleLogoutClick}
                      sx={{ 
                        py: 1.5, 
                        px: 2
                      }}
                    >
                      <Typography fontSize={15}>Logout</Typography>
                    </MenuItem>
                  </MenuList>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      <LogoutConfirmationDialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
});

UserProfileButton.displayName = 'User ProfileButton';

// Optimized DrawerContent with navigation and updated profile image handling
const DrawerContent = memo(({ onClose, navItems, currentPath, isLoggedIn, userInfo, onLogout }) => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Get full profile image URL
  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return null;
    // Check if the URL already has the baseurl
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    return `${baseurl}/${profileImage}`;
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    onLogout();
    onClose();
  };

  const profileImageUrl = getProfileImageUrl(userInfo?.profile_image);

  return (
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
              fontSize: '16px',
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
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '16px' }}>{name}</Typography>
          </ListItem>
        ))}
        <ListItem sx={{ px: 3, py: 1.8, justifyContent: 'center' }}>
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {profileImageUrl ? (
                <Avatar 
                  src={profileImageUrl}
                  alt={userInfo.username || "User   "}
                  sx={{ width: 60, height: 60 }}
                />
              ) : (
                <CircleUser  size={60} />
              )}
              <Typography variant="body1" sx={{ mb: 1 }}>
                {userInfo?.username || userInfo?.email || "User   "}
              </Typography>
              <Button
                onClick={handleLogoutClick}
                variant="outlined"
                color="error"
                sx={{ 
                  fontFamily: 'Poppins',
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1 
                }}
              >
                <LogOut size={16} />
                Logout
              </Button>
              
              <LogoutConfirmationDialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
              />
            </Box>
          ) : (
            <LoginButton />
          )}
        </ListItem>
      </List>
    </Box>
  );
});

DrawerContent.displayName = 'DrawerContent';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in and parse userInfo
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const storedUserInfo = localStorage.getItem('userInfo');
    
    if (authToken && storedUserInfo) {
      setIsLoggedIn(true);
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Error parsing user info', error);
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  }, []);

  const navItems = useMemo(() => [
    { name: 'Home', path: '/' },
    { name: 'Who we are', path: '/WhoWeAre' },
    { name: 'Courses', path: '/Courses' },
    { name: 'Templates', path: '/Templates' },
    { name: 'Contact Us', path: '/ContactUs' }
  ], []);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);
  
  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setUserInfo(null);
    navigate('/');
  }, [navigate]);

  // Check if the current path is the login or register page
  const isLoginPageOrRegisterPage = location.pathname === '/login' || location.pathname === '/register';

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
          {location.pathname === '/login' && ( // Show Sign Up button only on the login page
            <Link to="/register" style={{ textDecoration: 'none' }}>
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
                Sign Up
              </Button>
            </Link>
          )}
          {location.pathname === '/register' && ( // Show Login button only on the register page
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
                Login
              </Button>
            </Link>
          )}
          {isMobile ? (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ color: 'black' }}
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
          ) : (
            !isLoginPageOrRegisterPage && ( // Only render nav items if not on the login or register page
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {navItems.map(({ name, path }) => (
                  <NavButton 
                    key={path}
                    to={path}
                    isActive={location.pathname === path}
                  >
                    {name}
                  </NavButton>
                ))}
                {isLoggedIn ? (
                  <UserProfileButton userInfo={userInfo} onLogout={handleLogout} />
                ) : (
                  <LoginButton />
                )}
              </Box>
            )
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
          isLoggedIn={isLoggedIn}
          userInfo={userInfo}
          onLogout={handleLogout}
        />
      </Drawer>
    </>
  );
};

export default memo(Navbar);
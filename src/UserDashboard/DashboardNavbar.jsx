import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  InputBase,
  Avatar,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
  ClickAwayListener,
  Popper,
  Grow,
  MenuList,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Badge
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Menu as MenuIcon,
  Notifications as NotificationsIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseurl from '../ApiService/ApiService'; // Import your API base URL

// LogoutConfirmationDialog component
const LogoutConfirmationDialog = React.memo(({ open, onClose, onConfirm }) => {
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

const DashboardNavbar = ({ toggleSidebar }) => {
  const [logo, setLogo] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);
  // Removed the unused notificationsViewed state

  // Profile dropdown state
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const anchorRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getCurrentUserID = () => {
    try {
      const userData = localStorage.getItem("userInfo");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        return parsedUserData.id || parsedUserData.user_id || parsedUserData._id;
      }
      return null;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric'
    }).format(date);
  };

  const fetchNotifications = async () => {
    const userId = getCurrentUserID();
    setLoadingNotifications(true);
  
    try {
      const response = await axios.get(`${baseurl}/api/notification/all`);
  
      if (response.data.status === 'success' && response.data.data) {
        const userNotifications = response.data.data.filter(
          (notification) => notification.user_id === userId
        );
  
        // Format the notifications
        let formattedData = userNotifications.map((item) => ({
          id: item.id,
          name: item.user.username,
          title: item.title,
          message: item.message,
          timeAgo: formatTimeAgo(item.createdAt),
          read: item.is_read || false,
        }));
  
        const notificationsLastViewed = localStorage.getItem('notificationsLastViewed');
        const notificationsViewedBefore = notificationsLastViewed ? 
          new Date(notificationsLastViewed) : null;
        const now = new Date(); // Get current time
        
        // Check if the stored timestamp is in the past
        if (notificationsViewedBefore && notificationsViewedBefore >= now) {
          // Mark all as read in UI
          formattedData = formattedData.map(notification => ({
            ...notification,
            read: true
          }));
          setUnreadCount(0);
        } else {
          // Only count unread notifications
          const unreadNotifications = formattedData.filter(note => !note.read);
          setUnreadCount(unreadNotifications.length);
        }
        
        setNotifications(formattedData);

      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setErrorNotifications('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Function to mark notifications as read
  const markNotificationsAsRead = async () => {
    const userId = getCurrentUserID();
    
    try {
      // Store the current timestamp in localStorage
      localStorage.setItem('notificationsLastViewed', new Date().toISOString());
      
      setUnreadCount(0);
      
      // Update all notifications to be read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
      
      // Then send request to backend
      await axios.put(`${baseurl}/api/notification/mark-read`, {
        user_id: userId
      }).then(response => {
        setUnreadCount(0);
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      // Even if API call fails, they remain marked as read in UI
    }
  };

  const renderNotifications = () => {
    if (loadingNotifications) {
      return <Typography variant="body2" sx={{ p: 2 }}>Loading notifications...</Typography>;
    }

    if (errorNotifications) {
      return <Typography variant="body2" color="error" sx={{ p: 2 }}>{errorNotifications}</Typography>;
    }

    if (notifications.length === 0) {
      return <Typography variant="body2" sx={{ p: 2 }}>No notifications</Typography>;
    }

    return (
      <>
        {notifications.map(notification => (
          <Box key={notification.id} sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2">{notification.title}</Typography>
            <Typography variant="body2" color="text.secondary">{notification.message}</Typography>
            <Typography variant="caption" color="text.disabled">{notification.timeAgo}</Typography>
          </Box>
        ))}
        {notifications.length > 0 && (
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={() => navigate('/dashboard/notifications')}
              variant="text"
              size="small"
              sx={{ fontFamily: 'Poppins' }}
            >
              View All
            </Button>
          </Box>
        )}
      </>
    );
  };

  // Get user info from localStorage
  useEffect(() => {
    try {
      const userInfoData = localStorage.getItem('userInfo');
      if (userInfoData) {
        setUserInfo(JSON.parse(userInfoData));
      }
    } catch (err) {
      console.error('Error parsing user info from localStorage:', err);
    }
    
    // Fetch notifications when component mounts
    fetchNotifications();
    
    // Set up interval to fetch notifications periodically
    const notificationInterval = setInterval(fetchNotifications, 60000); // Every minute
    
    return () => clearInterval(notificationInterval);
  }, []);  // fetchNotifications doesn't need to be in deps array because it's defined in the same component scope

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

  // Profile dropdown handlers
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // Notification dropdown handlers
  const handleNotificationToggle = () => {
    // If opening notifications
    if (!notificationOpen) {
      // Mark as read immediately
      markNotificationsAsRead();
      // Then fetch updated list (which will respect the 'viewed' state)
      fetchNotifications();
    }
    // Toggle the notification panel
    setNotificationOpen((prevOpen) => !prevOpen);
  };

  const handleNotificationClose = (event) => {
    if (notificationRef.current && notificationRef.current.contains(event.target)) {
      return;
    }
    setNotificationOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
      setNotificationOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setNotificationOpen(false);
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const renderLogo = () => {
    if (loading) {
      return (
        <Box
          sx={{
            width: 100,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(224, 224, 224, 0.5)'
          }}
        >
          <CircularProgress size={24} sx={{ color: theme.palette.primary.main }} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          sx={{
            width: 100,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#e0e0e0'
          }}
        >
          <Typography variant="caption" color="error">
            Logo
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
          width: 100,
          height: 40,
          background: 'transparent',
          objectFit: 'contain',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      />
    );
  };

  // Get user profile image URL with proper handling
  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return null;
    // Check if the URL already has the baseurl
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    return `${baseurl}/${profileImage}`;
  };

  const profileImageUrl = getProfileImageUrl(userInfo?.profile_image);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#fff',
        boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleSidebar}
              sx={{ mr: 1, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {/* Logo */}
          {renderLogo()}
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.common.black, 0.05),
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.black, 0.1),
            },
            width: { xs: '40%', sm: '30%' },
            display: { xs: 'none', sm: 'block' }
          }}
        >
          <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center', height: '100%', pl: 2 }}>
            <SearchIcon sx={{ color: 'text.secondary' }} />
          </Box>
          <InputBase
            placeholder="Search Courses"
            sx={{
              width: '100%',
              pl: 5,
              py: 1,
              color: 'text.primary',
            }}
          />
        </Box>

        {/* Mobile Search Icon */}
        {isMobile && (
          <IconButton sx={{ color: 'text.primary', display: { sm: 'none' } }}>
            <SearchIcon />
          </IconButton>
        )}

        {/* Right Side - Notifications and Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notification Icon */}
          <IconButton
            ref={notificationRef}
            onClick={handleNotificationToggle}
            aria-controls={notificationOpen ? 'notification-menu' : undefined}
            aria-expanded={notificationOpen ? 'true' : undefined}
            aria-haspopup="true"
            sx={{
              color: 'text.primary',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Notification Dropdown */}
          <Popper
            open={notificationOpen}
            anchorEl={notificationRef.current}
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
                    width: 320,
                    maxHeight: 400,
                    overflow: 'hidden',
                    mt: 1
                  }}
                >
                  <ClickAwayListener onClickAway={handleNotificationClose}>
                    <Box>
                      <Box
                        sx={{
                          p: 2,
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          Notifications
                        </Typography>
                        {unreadCount > 0 && (
                          <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
                            {unreadCount} new
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                        {renderNotifications()}
                      </Box>
                    </Box>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>

          {/* Profile Avatar with Dropdown */}
          <IconButton
            onClick={handleToggle}
            ref={anchorRef}
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
            <Avatar
              src={profileImageUrl}
              alt={userInfo?.username || "User "}
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main
              }}
            >
              {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : "U"}
            </Avatar>
          </IconButton>

          {/* Profile Dropdown Menu */}
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
                        <Avatar
                          src={profileImageUrl}
                          alt={userInfo?.username || "User"}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: theme.palette.primary.main
                          }}
                        >
                          {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : "U"}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {userInfo?.username || userInfo?.firstName || "User"}
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
                          onClick={handleNavigate('/')}
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderBottom: '1px solid #f5f5f5'
                          }}
                        >
                          <Typography fontSize={15}>Home</Typography>
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

          {/* Logout Confirmation Dialog */}
          <LogoutConfirmationDialog
            open={logoutDialogOpen}
            onClose={handleLogoutCancel}
            onConfirm={handleLogoutConfirm}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;
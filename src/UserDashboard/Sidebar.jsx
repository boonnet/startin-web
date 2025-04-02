import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  IconButton,
  Typography,
  Toolbar,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SidebarLink from './SidebarLinks';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Favorite as FavoriteIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';

const Sidebar = ({ open, onClose, scrollContainer }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // Updated Sidebar menu items with correct paths
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'My Courses', icon: <SchoolIcon />, path: '/dashboard/mycourses' },
    // { text: 'My Learnings', icon: <BookIcon />, path: '/dashboard/mylearnings' },
    { text: 'My Templates', icon: <MenuBookIcon />, path: '/dashboard/mytemplates' },
    { text: 'Favorites', icon: <FavoriteIcon />, path: '/dashboard/favorites' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
    { text: 'Purchase History', icon: <HistoryIcon />, path: '/dashboard/history' },
    { text: 'Edit Profile', icon: <EditIcon />, path: '/dashboard/profile' },
  ];

  // Generate breadcrumbs based on current location
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    // Create breadcrumb items
    const breadcrumbs = [];
    
    // Add Home as the first item
    breadcrumbs.push({
      label: 'Home',
      path: '/',
    });
    
    // Map segments to breadcrumb items
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      
      // Convert path segment to readable name (capitalize and replace hyphens with spaces)
      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      // Use menu item text if available for better labels
      const menuItem = menuItems.find(item => item.path === currentPath);
      if (menuItem) {
        label = menuItem.text;
      }
      
      breadcrumbs.push({
        label,
        path: currentPath,
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = generateBreadcrumbs();

  // Sidebar width
  const drawerWidth = 320;

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      container={scrollContainer?.current}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid #eaeaea',
          bgcolor: '#fff',
          position: 'static', // Changed from default 'fixed' to 'static'
          height: '100%',
          overflowY: 'visible', // Changed to allow the parent container to control scrolling
        },
      }}
    >
      <Toolbar /> {/* Spacer to push content below AppBar */}
      
      {/* Mobile Close Button */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      {/* Breadcrumbs */}
      <Box sx={{ px: 2, py: 1 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ fontSize: '0.875rem' }}
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            
            return isLast ? (
              <Typography 
                key={item.path} 
                color="primary" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {item.label}
              </Typography>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                style={{ 
                  textDecoration: 'none',
                  color: '#6B7280',
                  fontSize: '0.875rem'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
      
      {/* Sidebar Menu */}
      <List component="nav" sx={{ px: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <SidebarLink
            key={item.text}
            icon={item.icon}
            text={item.text}
            path={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
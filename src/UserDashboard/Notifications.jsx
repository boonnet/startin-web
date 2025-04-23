import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Button,
  Divider
} from '@mui/material';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';

const NavigationItem = ({ name, title, message, timeAgo }) => (
  <ListItem alignItems="flex-start" sx={{ py: 1 }}>
    <ListItemAvatar>
      <Avatar sx={{ bgcolor: 'teal' }}>
        {name[0].toUpperCase()}
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" fontWeight="bold">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {timeAgo}
          </Typography>
        </Box>
      }
      secondary={
        <>
          <Typography variant="subtitle2" fontWeight="bold" component="span">
            {title}
          </Typography><br></br>
          <Typography variant="body2" color="text.secondary" component="span">
            {message}
          </Typography>
        </>
      }
    />
  </ListItem>
);

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

const NavigationsComponent = () => {
  const [navigationItems, setNavigationItems] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4); // Initially show 3 notifications

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

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = getCurrentUserID();

      try {
        const response = await axios.get(`${baseurl}/api/notification/all`);
        console.log("All notifications:", response.data);

        if (response.data.status === 'success' && response.data.data) {
          const userNotifications = response.data.data.filter(
            (notification) => notification.user_id === userId
          );

          const formattedData = userNotifications.map((item) => ({
            id: item.id,
            name: item.user.username,
            title: item.title,
            message: item.message,
            timeAgo: formatTimeAgo(item.createdAt),
          }));

          setNavigationItems(formattedData);
          console.log("Filtered notifications:", formattedData);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 1, navigationItems.length)); // Show only one more notification
  };

  return (
    <>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {navigationItems.slice(0, visibleCount).map((item, index) => (
          <React.Fragment key={item.id}>
            <NavigationItem 
              name={item.name} 
              title={item.title} 
              message={item.message} 
              timeAgo={item.timeAgo} 
            />
            {index < navigationItems.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
      
      {visibleCount < navigationItems.length && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button 
            variant="contained" 
            sx={{ bgcolor: 'primary.main', borderRadius: 2, px: 3 }}
            onClick={handleShowMore}
          >
            More Notification
          </Button>
        </Box>
      )}
    </>
  );
};

export default NavigationsComponent;

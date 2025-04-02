import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Container, 
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import baseurl from '../ApiService/ApiService'
import EditIcon from '@mui/icons-material/Edit';

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bioData: '',
    mobileNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Format image URL to handle relative paths
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // If it's already a full URL or a data URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Replace backslashes with forward slashes for consistent URL formatting
    const formattedPath = imagePath.replace(/\\/g, '/');
    
    // Combine with base URL
    return `${baseurl}/${formattedPath}`;
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.id) {
          throw new Error('User information not found');
        }

        // Fetch user data from API
        const response = await axios.get(`${baseurl}/api/user/${userInfo.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Update state with fetched data
        setProfileData({
          fullName: response.data.username || '',
          email: response.data.email || '',
          bioData: response.data.bio_data || '',
          mobileNumber: response.data.phone || ''
        });

        // Set profile image if available
        if (response.data.profile_image) {
          setPreviewImage(formatImageUrl(response.data.profile_image));
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({
          open: true,
          text: error.response?.data?.message || 'Failed to load user data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get token and user info
      const token = localStorage.getItem('authToken');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!token || !userInfo || !userInfo.id) {
        throw new Error('Authentication information not found');
      }
  
      // Create FormData object to send both text data and image file
      const formData = new FormData();
      formData.append('username', profileData.fullName);
      formData.append('email', profileData.email);
      formData.append('bio_data', profileData.bioData);
      formData.append('phone', profileData.mobileNumber);
      
      // Only append the image if a new one was selected
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }
  
      // Send update request using FormData
      const response = await axios.put(
        `${baseurl}/api/user/update/${userInfo.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'  // Important for file uploads
          }
        }
      );
  
      // Update localStorage with new data
      localStorage.setItem('userInfo', JSON.stringify({
        ...userInfo,
        username: profileData.fullName,
        email: profileData.email
      }));
      
      // If the response contains updated image path, update the preview
      if (response.data.profile_image) {
        setPreviewImage(formatImageUrl(response.data.profile_image));
      }
  
      setMessage({
        open: true,
        text: 'Profile updated successfully!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        open: true,
        text: error.response?.data?.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setMessage({ ...message, open: false });
  };

  if (initialLoad) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box py={4}>
        <Typography variant="h5" component="h1" gutterBottom>
          Edit Profile
        </Typography>
        
        <Box display="flex" justifyContent="center" my={3} position="relative">
          <Avatar
            src={previewImage || '/default-avatar.jpg'}
            alt="Profile"
            sx={{ 
              width: 100, 
              height: 100,
              bgcolor: '#e0f7fa' // Light blue background
            }}
          />
          <IconButton 
            sx={{ 
              position: 'absolute', 
              bottom: 0, 
              right: '35%',
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              padding: '4px'
            }}
            component="label"
          >
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box mb={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Full Name
            </Typography>
            <TextField
              fullWidth
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Box mb={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Email ID
            </Typography>
            <TextField
              fullWidth
              name="email"
              value={profileData.email}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Box mb={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Bio Data
            </Typography>
            <TextField
              fullWidth
              name="bioData"
              value={profileData.bioData}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Box mb={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Mobile Number
            </Typography>
            <TextField
              fullWidth
              name="mobileNumber"
              value={profileData.mobileNumber}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ 
              py: 1.5, 
              textTransform: 'none', 
              borderRadius: 1,
              bgcolor: '#0052cc', // Royal blue color
              '&:hover': {
                bgcolor: '#0043a9',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Profile'}
          </Button>
        </Box>
      </Box>
      
      <Snackbar open={message.open} autoHideDuration={6000} onClose={handleCloseMessage}>
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditProfile;
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Tabs,
  Tab,
  Divider,
  Alert,
  IconButton,
  Rating,
  Snackbar
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import baseurl from '../ApiService/ApiService';
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import DescriptionIcon from '@mui/icons-material/Description';

// Styled component for course cards
const CourseCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.3s, box-shadow 0.3s',
  boxShadow: 'none',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
}));

const UserFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [courses, setCourses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [userId, setUserId] = useState(null);
  const [enrolledTemplates, setEnrolledTemplates] = useState([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get current user ID
  const getCurrentUserID = () => {
    try {
      const userData = localStorage.getItem("userInfo");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        return parsedUserData.id || parsedUserData.user_id || parsedUserData.uid || parsedUserData._id;
      }
      return null;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  };

  // Function to calculate average rating
  const calculateAverageRating = (ratings) => {
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return 0; // Return 0 if there are no ratings
    const total = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (total / ratings.length).toFixed(1); // Return average rounded to 1 decimal place
  };

  // Helper function to parse files array from template
  const getFilesArray = (template) => {
    let filesArray = [];
    try {
      if (template.files && typeof template.files === 'string') {
        filesArray = JSON.parse(template.files);
      } else if (Array.isArray(template.files)) {
        filesArray = template.files;
      }
    } catch (error) {
      console.error("Error parsing template files:", error);
    }
    return filesArray;
  };

  // Handle heart icon click for courses
  const handleCourseFavoriteToggle = async (event, course) => {
    event.stopPropagation(); // Prevent card click

    if (!userId) {
      setSnackbar({
        open: true,
        message: 'Please login to add favorites',
        severity: 'warning'
      });
      return;
    }

    try {
      const isFavorite = isCourseFavorite(course.id);

      if (isFavorite) {
        // Find the favorite ID
        const favoriteResponse = await axios.get(`${baseurl}/api/favorites/check/course?user_id=${userId}&course_id=${course.id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (favoriteResponse.data && favoriteResponse.data.data) {
          // Delete from favorites
          await axios.delete(`${baseurl}/api/favorites/delete/${favoriteResponse.data.data.id}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });

          // Update local state
          setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== favoriteResponse.data.data.id));
          setSnackbar({
            open: true,
            message: 'Removed from favorites',
            severity: 'success'
          });
        }
      } else {
        // Add to favorites
        await axios.post(`${baseurl}/api/favorites/add`, {
          user_id: userId,
          course_id: course.id
        }, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        // Update local state
        setFavorites(prevFavorites => [...prevFavorites, { id: course.id, user_id: userId }]);
        setSnackbar({
          open: true,
          message: 'Added to favorites',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setSnackbar({
        open: true,
        message: 'Error updating favorites',
        severity: 'error'
      });
    }
  };

  // Check if course is favorited
  const isCourseFavorite = (courseId) => {
    return favorites.some(fav => fav.course_id === courseId);
  };

  // Handle course card click
  const handleCourseClick = (course) => {
    if (isCourseEnrolled(course.id)) {
      navigate(`/coursecontent/${course.id}`, { state: { course } });
    } else {
      navigate(`/course/${course.id}`, { state: { course } });
    }
  };

  // Check if course is enrolled
  const isCourseEnrolled = (courseId) => {
    // return enrolledCourses.some(id => id && courseId && id.toString() === courseId.toString());
  };

  // Handle heart icon click for templates
  const handleTemplateFavoriteToggle = async (event, template) => {
    event.stopPropagation(); // Prevent card click
  
    if (!userId) {
      setSnackbar({
        open: true,
        message: 'Please login to add favorites',
        severity: 'warning'
      });
      return;
    }
  
    try {
      const isFavorite = isTemplateFavorite(template.id);
  
      if (isFavorite) {
        // Find the favorite ID
        const favoriteResponse = await axios.get(`${baseurl}/api/favorites/check/template?user_id=${userId}&template_id=${template.id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
  
        if (favoriteResponse.data && favoriteResponse.data.data) {
          // Delete from favorites
          await axios.delete(`${baseurl}/api/favorites/delete/${favoriteResponse.data.data.id}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });
  
          // Update local state
          setFavoriteTemplates(prevFavorites =>
            prevFavorites.filter(id => id.toString() !== template.id.toString())
          );
  
          setSnackbar({
            open: true,
            message: 'Removed from favorites',
            severity: 'success'
          });
        }
      } else {
        // Add to favorites
        await axios.post(`${baseurl}/api/favorites/add`, {
          user_id: userId,
          template_id: template.id
        }, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
  
        // Update local state
        setFavoriteTemplates(prevFavorites => [...prevFavorites, template.id]);
  
        setSnackbar({
          open: true,
          message: 'Added to favorites',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setSnackbar({
        open: true,
        message: 'Error updating favorites',
        severity: 'error'
      });
    }
  };

  // Check if template is favorited
  const isTemplateFavorite = (templateId) => {
    return favoriteTemplates.some(id => id && templateId && id.toString() === templateId.toString());
  };

  useEffect(() => {
    const currentUserId = getCurrentUserID();
    setUserId(currentUserId);
    fetchUserFavorites(currentUserId);
  }, []);

  const fetchUserFavorites = async (currentUserId) => {
    setLoading(true);
    try {
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }
  
      const response = await axios.get(`${baseurl}/api/favorites/all`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
  
      if (response.data && response.data.data) {
        const userFavorites = response.data.data.filter(favorite => favorite.user_id === currentUserId);
        setFavorites(userFavorites);
  
        // Process courses and templates
        const courseFavorites = [];
        const templateFavorites = [];
        const templateIds = []; // New array to hold template IDs
  
        userFavorites.forEach(item => {
          if (item.Course) {
            courseFavorites.push(item.Course);
          } else if (item.Template) {
            templateFavorites.push(item.Template);
            templateIds.push(item.Template.id); // Collect template IDs
          }
        });
  
        setCourses(courseFavorites);
        setTemplates(templateFavorites);
        setFavoriteTemplates(templateIds); // Set favorite template IDs
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle template card click
  const handleTemplateClick = (template) => {
    // If already enrolled, go to template details
    if (isTemplateEnrolled(template.id)) {
      navigate(`/templatedetails/${template.id}`, { state: { template } });
    } else {
      // If not enrolled, go to purchase page
      navigate(`/template/${template.id}`, { state: { template } });
    }
  };

  // Check if template is enrolled
  const isTemplateEnrolled = (templateId) => {
    // Convert to string for comparison if needed
    return enrolledTemplates.some(id => id && templateId && id.toString() === templateId.toString());
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await axios.delete(`${baseurl}/api/favorites/delete/${favoriteId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      // Update state to remove the item
      if (tabValue === 0) {
        setCourses(courses.filter(course => course.id !== favoriteId));
      } else {
        setTemplates(templates.filter(template => template.id !== favoriteId));
      }

      setSnackbar({
        open: true,
        message: 'Removed from favorites',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography>Loading your favorites...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FavoriteIcon sx={{ color: '#f44336', mr: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          My Favorites
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="favorites tabs">
          <Tab label={`Courses (${courses.length})`} />
          <Tab label={`Templates (${templates.length})`} />
        </Tabs>
      </Box>
      
      {tabValue === 0 && (
        <Box>
          {courses.length === 0 ? (
            <Alert severity="info">You haven't added any courses to favorites yet.</Alert>
          ) : (
            <Grid container spacing={2}>
              {courses.map((course) => (
                <Grid item xs={12} md={4} key={course.id}>
                  <CourseCard onClick={() => handleCourseClick(course)}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={course.course_image ? `${baseurl}/${course.course_image.replace(/\\/g, '/')}` : "fallback-image-url"}
                      alt={course.course_title || "Course"}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            height: '40px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            flex: 1
                          }}
                        >
                          {course.course_title || "Untitled Course"}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ ml: 1, p: 0.5 }}
                          onClick={(e) => handleCourseFavoriteToggle(e, course)}
                        >
                          {isCourseFavorite(course.id) ? (
                            <FavoriteIcon sx={{ color: 'red' }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ color: 'grey' }} />
                          )}
                        </IconButton>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          height: '40px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {course.course_description?.substring(0, 100) || "No description available"}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          name={`rating-${course.id}`}
                          value={calculateAverageRating(course.Ratings)}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ color: '#6a6f73', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#6a6f73' }}>
                            {course.time_spend || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SignalCellularAltIcon sx={{ color: '#6a6f73', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#6a6f73' }}>
                            {course.course_level || "Beginner"}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CourseCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {templates.length === 0 ? (
            <Alert severity="info">You haven't added any templates to favorites yet.</Alert>
          ) : (
            <Grid container spacing={2}>
              {templates.map((template, index) => {
                // Parse files if it's a JSON string
                const filesArray = getFilesArray(template);
                
                return (
                  <Grid item xs={12} md={4} key={template.id || index}>
                    <CourseCard onClick={() => handleTemplateClick(template)}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={template.cover_image ? `${baseurl}/${template.cover_image.replace(/\\/g, '/')}` : "fallback-image-url"}
                        alt={template.template_title || "Template"}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              height: '40px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              flex: 1
                            }}
                          >
                            {template.template_name || "Untitled Template"}
                          </Typography>
                          <IconButton
                            size="small"
                            sx={{ ml: 1, p: 0.5 }}
                            onClick={(e) => handleTemplateFavoriteToggle(e, template)}
                          >
                            {isTemplateFavorite(template.id) ? (
                              <FavoriteIcon sx={{ color: 'red' }} />
                            ) : (
                              <FavoriteBorderIcon sx={{ color: 'grey' }} />
                            )}
                          </IconButton>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            height: '40px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {template.description || "No description available"}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DescriptionIcon sx={{ color: '#10b981', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            <Box component="span" sx={{ color: '#10b981', mr: 0.5, fontWeight: 500 }}>
                              {filesArray.length || 0}
                            </Box>
                            {filesArray.length === 1 ? 'File' : 'Files'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            ₹ {template.price || "Free"}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CourseCard>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserFavorites;
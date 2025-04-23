import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Container,
  IconButton,
  Rating
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import computer from '../assets/computer.png';
import baseurl from "../ApiService/ApiService";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styled } from "@mui/material/styles";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Function to determine color based on level
const getLevelColor = (level) => {
  switch (level) {
    case 'Beginner':
      return '#38bdf8'; // Light blue
    case 'Intermediate':
      return '#10b981'; // Green
    case 'Advanced':
      return '#f59e0b'; // Amber
    default:
      return '#10b981';
  }
};

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

const MyCourses = () => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [enrolledTemplates, setEnrolledTemplates] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState([]);

  // Handle course card click
  const handleCourseClick = (course) => {
    // If already enrolled, go to course details/learning page
    if (isCourseEnrolled(course.id)) {
      navigate(`/coursecontent/${course.id}`, { state: { course } });
    } else {
      // If not enrolled, go to purchase page
      navigate(`/course/${course.id}`, { state: { course } });
    }
  };

  // Check if course is enrolled
  const isCourseEnrolled = (courseId) => {
    // Convert to string for comparison if needed
    return enrolledCourses.some(id => id && courseId && id.toString() === courseId.toString());
  };

  const getCurrentUserID = () => {
    try {
      // Check if user data exists in localStorage
      const userData = localStorage.getItem("userInfo");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        // Return user ID from the userData object
        return parsedUserData.id || parsedUserData.user_id || parsedUserData._id;
      }

      // Alternatively, check for a JWT token
      const token = localStorage.getItem("token");
      if (token) {
        // If you have a function to decode the token, use it here
        // For example: return decodeToken(token).user_id;
      }

      return null;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  };

  const userId = getCurrentUserID();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check if course is favorited
  const isCourseFavorite = (courseId) => {
    return favoriteCourses.some(id => id && courseId && id.toString() === courseId.toString());
  };

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
          setFavoriteCourses(prevFavorites =>
            prevFavorites.filter(id => id.toString() !== course.id.toString())
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
          course_id: course.id
        }, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        // Update local state
        setFavoriteCourses(prevFavorites => [...prevFavorites, course.id]);

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

  // Handle buy now button click for courses
  const handleCourseBuyNow = (course, event) => {
    event.stopPropagation(); // Prevent card click event
    navigate(`/course/${course.id}`, { state: { course } });
  };

  useEffect(() => {
    const fetchAllCourses = async () => {
      const userId = getCurrentUserID();
      try {
        const enrollmentResponse = await axios.get(`${baseurl}/api/enrollment/all`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        console.log("All enrollments response:", enrollmentResponse.data);

        // Process enrollments data
        if (enrollmentResponse.data && enrollmentResponse.data.data) {
          setAllEnrollments(enrollmentResponse.data.data);

          // Filter enrollments for the current user
          if (userId) {
            const userEnrollments = enrollmentResponse.data.data.filter(
              enrollment => enrollment.user_id === userId ||
                (enrollment.User && enrollment.User.id === userId)
            );

            // Extract course objects from user enrollments
            const enrolledCourses = userEnrollments.map(enrollment => {
              return {
                ...enrollment,
                Course: enrollment.Course // Ensure Course object is included
              };
            });

            setEnrolledCourses(enrolledCourses); // Store the full enrollment objects
            console.log("Current user enrolled courses:", enrolledCourses);
          }
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      }

      // Fetch user favorites if user is logged in
      if (userId) {
        try {
          // Fetch all favorites
          const favoritesResponse = await axios.get(`${baseurl}/api/favorites/all`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });

          if (favoritesResponse.data && favoritesResponse.data.data) {
            // Filter favorites for the current user
            const userFavorites = favoritesResponse.data.data.filter(
              favorite => favorite.user_id === userId
            );

            // Extract favorite course IDs
            const favoriteCourseIds = userFavorites
              .filter(favorite => favorite.course_id)
              .map(favorite => favorite.course_id);

            setFavoriteCourses(favoriteCourseIds);
            console.log("Current user favorite courses:", favoriteCourseIds);

            // Extract favorite template IDs
            const favoriteTemplateIds = userFavorites
              .filter(favorite => favorite.template_id)
              .map(favorite => favorite.template_id);

            setFavoriteTemplates(favoriteTemplateIds);
            console.log("Current user favorite templates:", favoriteTemplateIds);
          }
        } catch (err) {
          console.error("Error fetching favorites:", err);
        }
      }
    };

    fetchAllCourses();
  }, []);

  const calculateAverageRating = (ratings) => {
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return "N/A"; // Return "N/A" if there are no ratings
    const total = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (total / ratings.length).toFixed(1); // Return average rounded to 1 decimal place
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        My Courses
      </Typography>

      {enrolledCourses.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You haven't enrolled in any Courses yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/Courses')}
            sx={{
              bgcolor: '#0d6efd',
              textTransform: 'none',
              px: 3,
              borderRadius: 1
            }}
          >
            Browse Courses
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {enrolledCourses.map((enrollment, index) => {
            const course = enrollment.Course; // Access the Course object from enrollment
            if (!course) {
              console.error("Course is undefined for enrollment:", enrollment);
              return null; // Skip rendering if course is undefined
            }
            return (
              <Grid item xs={12} md={4} key={course.id || index}>
                <CourseCard
                  onClick={() => navigate(`/coursecontent/${course.id}`)}
                >
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
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MyCourses;
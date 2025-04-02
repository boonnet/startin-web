import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import pitchdeckImg from '../assets/pitchdeck.png';
import crowdfundingImg from '../assets/crowdfunding.png';
import baseurl from '../ApiService/ApiService';
import axios from 'axios';

// Mock image paths (in a real app, you'd import actual images)
// const pitchdeckImg = '../assets/pitchdeck.png';
// const crowdfundingImg = '/api/placeholder/300/150';

const learningData = [];

// Utility function to get color based on level
const getLevelColor = (level) => {
  switch(level) {
    case 'Beginner':
      return '#4CAF50'; // Green
    case 'Intermediate':
      return '#2196F3'; // Blue
    case 'Advanced':
      return '#9C27B0'; // Purple
    default:
      return '#2196F3';
  }
};

const MyLearning = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
  
  useEffect(() => {
    const fetchAllCourses = async () => {
      const userId = getCurrentUserID();
      try {
        const enrollmentResponse = await axios.get(`${baseurl}/api/enrollment/all`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });


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
          }
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      }
    };

    fetchAllCourses();
  }, []);

  const handleViewCourse = (courseId) => {
    navigate(`/coursecontent/${courseId}`);
  };
  
  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: { xs: '100%', sm: '95%', md: 800 }, 
      margin: '0 auto', 
      p: { xs: 1, sm: 2 } 
    }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        gutterBottom 
        sx={{ fontWeight: 'bold', my: { xs: 2, sm: 3 } }}
      >
        My Learnings
      </Typography>
      
      <Stack spacing={2}>
        {enrolledCourses.map((enrollment, index) => {
           const course = enrollment.Course; // Access the Course object from enrollment
           if (!course) {
             console.error("Course is undefined for enrollment:", enrollment);
             return null; // Skip rendering if course is undefined
           }
          return (
            <Card key={`${course.id}-${index}`} sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              height: isMobile ? 'auto' : { xs: 'auto', sm: 164 },
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <CardMedia
                component="img"
                sx={{ 
                  width: isMobile ? '100%' : isTablet ? 200 : 300, 
                  height: isMobile ? 180 : '100%', 
                  objectFit: 'cover' 
                }}
                image={course.course_image ? `${baseurl}/${course.course_image.replace(/\\/g, '/')}` : "fallback-image-url"}
                alt={course.course_title || "Course"}
              />
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flexGrow: 1,
                p: { xs: 1.5, sm: 2 },
                justifyContent: 'space-between'
              }}>
                <CardContent sx={{ flex: '1 0 auto', p: 0, pb: 1 }}>
                  <Typography 
                    component="h2" 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    sx={{ fontWeight: 'bold', mb: { xs: 1.5, sm: 2 } }}
                  >
                    {course.course_title}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center', 
                    gap: isMobile ? 1.5 : 3 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        bgcolor: '#e3f2fd', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        p: 0.5,
                        mr: 1
                      }}>
                        <MenuBookIcon sx={{ fontSize: 16, color: '#03a9f4' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                      {course.Lessions.length} Lessons
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1
                      }}>
                        <SignalCellularAltIcon sx={{ 
                          fontSize: 16, 
                          color: getLevelColor(course.level)
                        }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{
                        color: getLevelColor(course.level)
                      }}>
                        {course.course_level}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        bgcolor: '#e8f5e9', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        p: 0.5,
                        mr: 1
                      }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {course.time_spend}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <Box sx={{ mt: isMobile ? 1 : 0 }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => {
                      if (course && course.id) {
                        handleViewCourse(course.id);
                      } else {
                        console.warn('Course ID is undefined for course:', course);
                      }
                    }}
                    sx={{ 
                      bgcolor: '#0d6efd',
                      textTransform: 'none',
                      px: 3,
                      borderRadius: 1
                    }}
                  >
                    View
                  </Button>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default MyLearning;
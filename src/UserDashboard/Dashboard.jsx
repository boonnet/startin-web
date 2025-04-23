import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme 
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import baseurl from '../ApiService/ApiService';
import axios from 'axios';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledTemplates, setEnrolledTemplates] = useState([]);
  const [courseCount, setCourseCount] = useState(0);
  const [courses, setCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);

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

  // Check for authentication and redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userInfo = localStorage.getItem("userInfo");
    
    if (!token || !userInfo) {
      // User is not logged in, redirect to login page
      navigate('/login');
    }
  }, [navigate]);

  // Fetch enrolled courses and templates
  useEffect(() => {
    const fetchAllEnrollments = async () => {
      const userId = getCurrentUserID();
      if (!userId) {
        // Additional check to prevent API calls if no user ID
        return;
      }
      
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

            // Separate course and template enrollments
            const coursesEnrolled = userEnrollments.filter(enrollment => enrollment.course_id);
            const templatesEnrolled = userEnrollments.filter(enrollment => enrollment.template_id);

            setEnrolledCourses(coursesEnrolled);
            setEnrolledTemplates(templatesEnrolled);
            console.log("Current user enrolled courses:", coursesEnrolled);
            console.log("Current user enrolled templates:", templatesEnrolled);
          }
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        // If error is due to authentication, redirect
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login');
        }
      }
    };

    fetchAllEnrollments();
  }, [navigate]);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${baseurl}/api/course/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setCourses(data);
          setCourseCount(data.length);
        } else if (data && typeof data.courses !== 'undefined') {
          setCourses(data.courses);
          setCourseCount(data.courses.length);
        } else {
          console.error('Unexpected data format:', data);
          setCourseCount(0);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourseCount(0);
      }
    };
    fetchCourses();
  }, []);

  // Fetch course progress data
  useEffect(() => {
    const fetchCourseProgress = async () => {
      const userId = getCurrentUserID();
      if (!userId) {
        // Don't fetch progress if user is not logged in
        return;
      }
      
      try {
        const response = await fetch(`${baseurl}/api/course_progress/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch course progress');
        }
        const result = await response.json();
        console.log('Fetched course progress data:', result);
        
        if (result.success && Array.isArray(result.data)) {
          setCourseProgress(result.data);
          
          // Process completed courses
          const userId = getCurrentUserID();
          const coursesProgressMap = {};
          
          // Group progress entries by course
          result.data.forEach(progress => {
            if (progress.user_id === userId) {
              if (!coursesProgressMap[progress.course_id]) {
                coursesProgressMap[progress.course_id] = {
                  totalLessons: 0,
                  completedLessons: 0,
                  lastAccessed: new Date(0)
                };
              }
              
              coursesProgressMap[progress.course_id].totalLessons++;
              
              if (progress.status === 'completed') {
                coursesProgressMap[progress.course_id].completedLessons++;
              }
              
              // Track the most recent access
              const accessDate = new Date(progress.last_accessed_at);
              if (accessDate > coursesProgressMap[progress.course_id].lastAccessed) {
                coursesProgressMap[progress.course_id].lastAccessed = accessDate;
              }
            }
          });
          
          // Determine which courses are fully completed (100%)
          const completed = [];
          for (const [courseId, data] of Object.entries(coursesProgressMap)) {
            if (data.totalLessons > 0 && data.completedLessons === data.totalLessons) {
              completed.push(parseInt(courseId));
            }
          }
          
          setCompletedCourses(completed);
          console.log('Completed courses:', completed);
        }
      } catch (error) {
        console.error('Error fetching course progress:', error);
        // Handle unauthorized errors
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          navigate('/login');
        }
      }
    };
    
    fetchCourseProgress();
  }, [navigate]);

  // Calculate completion percentage for each course
  const calculateCompletionPercentage = (courseId) => {
    const userId = getCurrentUserID();
    const courseProgressEntries = courseProgress.filter(
      progress => progress.course_id === courseId && progress.user_id === userId
    );
    
    if (courseProgressEntries.length === 0) return 0;
    
    const totalLessons = courseProgressEntries.length;
    const completedLessons = courseProgressEntries.filter(
      progress => progress.status === 'completed'
    ).length;
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  // Get total enrollments (courses + templates)
  const getTotalCourseEnrollments = () => {
    return enrolledCourses.length
  };

  const getTotalTemplatesEnrollments = () => {
    return enrolledTemplates.length
  };

  // Get number of files for a template
  const getTemplateFilesCount = (template) => {
    if (!template) return 0;
    
    try {
      if (template.files) {
        if (typeof template.files === 'string') {
          return JSON.parse(template.files).length;
        } else if (Array.isArray(template.files)) {
          return template.files.length;
        }
      }
      return 0;
    } catch (error) {
      console.error("Error parsing template files:", error);
      return 0;
    }
  };

  // Get enrolled course details
  const getEnrolledCourseDetails = () => {
    // Map enrolled course IDs to their full course objects from the courses array
    return enrolledCourses.map(enrollment => {
      const courseId = enrollment.course_id;
      const courseDetails = courses.find(course => course.id === courseId);
      return {
        ...enrollment,
        courseDetails
      };
    }).filter(item => item.courseDetails); // Filter out any that didn't find a match
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        pt: { xs: 9, md: 10 },
        backgroundColor: '#F9F9F9'
      }}
    >
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard
      </Typography>
      
      {/* Status Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#E8F0FE' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Enrolled Courses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {getTotalCourseEnrollments()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#E8F0FE' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Enrolled Templates
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {getTotalTemplatesEnrollments()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#F8E8FF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Courses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {courseCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#E0FBF3' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Completed Courses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {completedCourses.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Enrolled Courses Timeline */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Enrolled Courses
        </Typography>
        {enrolledCourses.length > 0 ? (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#F5F7FE' }}>
                <TableRow>
                  <TableCell>Sl. No.</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Course Level</TableCell>
                  <TableCell>Completion Percentage</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getEnrolledCourseDetails().map((item, index) => {
                  const course = item.courseDetails;
                  if (!course) return null;
                  
                  const completionPercentage = calculateCompletionPercentage(course.id);
                  const isCompleted = completedCourses.includes(course.id);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{course.course_title}</TableCell>
                      <TableCell>{course.course_level}</TableCell>
                      <TableCell>{`${completionPercentage}%`}</TableCell>
                      <TableCell sx={{ 
                        color: isCompleted ? 'green' : 
                               completionPercentage > 0 ? 'orange' : 'blue',
                        fontWeight: 'bold'
                      }}>
                        {isCompleted ? 'Completed' : 
                         completionPercentage > 0 ? 'In Progress' : 'Enrolled'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body1">You haven't enrolled in any courses yet.</Typography>
          </Paper>
        )}
      </Box>
      
      {/* Templates Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Enrolled Templates
        </Typography>
        {enrolledTemplates.length > 0 ? (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#F5F7FE' }}>
                <TableRow>
                  <TableCell>Sl. No.</TableCell>
                  <TableCell>Template Name</TableCell>
                  <TableCell>No. of Documents</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrolledTemplates.map((enrollment, index) => {
                  const template = enrollment.Template;
                  const filesCount = getTemplateFilesCount(template);
                  
                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{template?.template_name || 'Unnamed Template'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DescriptionIcon sx={{ color: '#10b981', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            <Box component="span" sx={{ color: '#10b981', mr: 0.5, fontWeight: 500 }}>
                              {filesCount}
                            </Box> Files
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'blue',
                        fontWeight: 'bold'
                      }}>
                        Purchased
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body1">You haven't purchased any templates yet.</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
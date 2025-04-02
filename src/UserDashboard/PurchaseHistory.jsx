import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import { saveAs } from 'file-saver';

const PurchaseHistory = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledTemplates, setEnrolledTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [certificateDialog, setCertificateDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const getCurrentUserID = () => {
    try {
      const userData = localStorage.getItem("userInfo");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        return parsedUserData.id || parsedUserData.user_id || parsedUserData._id;
      }

      const token = localStorage.getItem("token");
      if (token) {
        // If you have a function to decode the token, use it here
      }

      return null;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  };

  // Fetch enrolled courses and templates
  useEffect(() => {
    const fetchAllEnrollments = async () => {
      const userId = getCurrentUserID();
      try {
        const enrollmentResponse = await axios.get(`${baseurl}/api/enrollment/all`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (enrollmentResponse.data && enrollmentResponse.data.data) {
          setAllEnrollments(enrollmentResponse.data.data);

          if (userId) {
            const userEnrollments = enrollmentResponse.data.data.filter(
              enrollment => enrollment.user_id === userId ||
                (enrollment.User && enrollment.User.id === userId)
            );

            const coursesEnrolled = userEnrollments.filter(enrollment => enrollment.course_id);
            const templatesEnrolled = userEnrollments.filter(enrollment => enrollment.template_id);

            setEnrolledCourses(coursesEnrolled);
            setEnrolledTemplates(templatesEnrolled);
          }
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      }
    };

    fetchAllEnrollments();
  }, []);

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
        } else if (data && typeof data.courses !== 'undefined') {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch course progress data
  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const response = await fetch(`${baseurl}/api/course_progress/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch course progress');
        }
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setCourseProgress(result.data);
          
          const userId = getCurrentUserID();
          const coursesProgressMap = {};
          
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
              
              const accessDate = new Date(progress.last_accessed_at);
              if (accessDate > coursesProgressMap[progress.course_id].lastAccessed) {
                coursesProgressMap[progress.course_id].lastAccessed = accessDate;
              }
            }
          });
          
          const completed = [];
          for (const [courseId, data] of Object.entries(coursesProgressMap)) {
            if (data.totalLessons > 0 && data.completedLessons === data.totalLessons) {
              completed.push(parseInt(courseId));
            }
          }
          
          setCompletedCourses(completed);
        }
      } catch (error) {
        console.error('Error fetching course progress:', error);
      }
    };
    
    fetchCourseProgress();
  }, []);

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

  // Get course price (mock function - replace with actual API call if available)
  const getCoursePrice = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return '$0.00';
    
    switch(course.course_level?.toLowerCase()) {
      case 'beginner': return '$150.00';
      case 'intermediate': return '$250.00';
      case 'advanced': return '$450.00';
      default: return '$200.00';
    }
  };

  // Combine enrolled courses and templates into a single array for display
  const getPurchaseData = () => {
    const courseData = enrolledCourses.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      const completionPercentage = calculateCompletionPercentage(enrollment.course_id);
      const isCompleted = completedCourses.includes(enrollment.course_id);
      
      return {
        id: enrollment.id,
        courseId: enrollment.course_id,
        type: 'course',
        name: course?.course_title || 'Unknown Course',
        level: course?.course_level || 'Unknown Level',
        completionLevel: isCompleted ? 'Completed' : `${completionPercentage}%`,
        price: course?.course_price?`₹${course.course_price.toFixed(2)}`:'₹0',
        completed: isCompleted,
        createdAt: enrollment.created_at,
        certificateTemplate: course?.certificate_template
      };
    });

    const templateData = enrolledTemplates.map(enrollment => {
      const template = enrollment.Template;
      
      return {
        id: enrollment.id,
        type: 'template',
        name: template?.template_name || 'Unknown Template',
        level: 'N/A',
        completionLevel: 'N/A',
        price: template?.price ? `₹${template.price.toFixed(2)}` : '₹0.00',
        completed: false,
        createdAt: enrollment.created_at
      };
    });

    // Sort by creation date (newest first)
    return [...courseData, ...templateData].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const handleDownloadCertificate = async (course) => {
    try {
      if (!course.certificateTemplate) {
        throw new Error("Certificate template not available for this course");
      }

      // Construct the full URL for the certificate template
      const certificateUrl = course.certificateTemplate.startsWith('http')
        ? course.certificateTemplate
        : `${baseurl}/${course.certificateTemplate}`;

      // Fetch the certificate
      const response = await fetch(certificateUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch certificate");
      }

      // Get the blob and save it
      const blob = await response.blob();
      const fileName = `${course.name.replace(/\s+/g, '_')}_Certificate.${blob.type.split('/')[1] || 'png'}`;
      saveAs(blob, fileName);

      setSnackbar({
        open: true,
        message: "Certificate download started!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading certificate:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to download certificate",
        severity: "error",
      });
    } finally {
      setCertificateDialog(false);
    }
  };

  const handleCertificateClick = (course) => {
    setSelectedCourse(course);
    setCertificateDialog(true);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Purchase History
      </Typography>
      
      <TableContainer component={Paper} sx={{ 
        borderRadius: 1,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f7ff' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Sl. No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Invoice</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getPurchaseData().map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.type === 'course' ? 'Course' : 'Template'}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    startIcon={<DownloadIcon />}
                    sx={{ 
                      color: '#3366ff', 
                      textTransform: 'none',
                      fontSize: '0.8rem',
                    }}
                  >
                    Download Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Certificate Download Dialog */}
      <Dialog open={certificateDialog} onClose={() => setCertificateDialog(false)}>
        <DialogTitle>Download Certificate</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedCourse?.certificateTemplate 
              ? "Click the button below to download your certificate of completion."
              : "Certificate template not available for this course."}
          </DialogContentText>
          {selectedCourse?.certificateTemplate && (
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <img 
                src={`${baseurl}/${selectedCourse.certificateTemplate}`} 
                alt="Certificate Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 8 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDialog(false)}>Cancel</Button>
          {selectedCourse?.certificateTemplate && (
            <Button 
              onClick={() => handleDownloadCertificate(selectedCourse)}
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
            >
              Download Certificate
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseHistory;
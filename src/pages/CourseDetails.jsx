import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedButton from "../components/Button";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Rating
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import StarIcon from "@mui/icons-material/Star";
import CheckIcon from "@mui/icons-material/Check";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LanguageIcon from "@mui/icons-material/Language";
import LaptopIcon from "@mui/icons-material/Laptop";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import MicIcon from "@mui/icons-material/Mic";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import baseurl from "../ApiService/ApiService";
import { useNavigate } from "react-router-dom";

const CourseDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const courseData = location.state?.course;
  const navigate = useNavigate();

  const [course, setCourse] = useState(courseData || null);
  const [loading, setLoading] = useState(!courseData);
  const [error, setError] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [showVideo, setShowVideo] = useState(false);

  // Added states for enrollment
  const [enrolling, setEnrolling] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

    // Function to calculate average rating
    const calculateAverageRating = (ratings) => {
      if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return "N/A"; // Return "N/A" if there are no ratings
      const total = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      return (total / ratings.length).toFixed(1); // Return average rounded to 1 decimal place
    };

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseData) {
        try {
          setLoading(true);
          const response = await axios.get(`${baseurl}/api/course/${id}`);
          setCourse(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching course details:", err);
          setError("Failed to load course details. Please try again later.");
          setLoading(false);
        }
      }
    };

    const fetchRelatedCourses = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/course/all`);
        if (response.data && Array.isArray(response.data.courses)) {
          // Get courses in the same category, excluding current course
          const filtered = response.data.courses
            .filter(
              (item) =>
                item.sub_category ===
                  (courseData?.sub_category || course?.sub_category) &&
                item.id !== (courseData?.id || course?.id || id)
            )
            .slice(0, 3); // Limit to 3 related courses
          setRelatedCourses(filtered);
        }
      } catch (err) {
        console.error("Error fetching related courses:", err);
      }
    };

    fetchCourseData();
    fetchRelatedCourses();
  }, [id, courseData, course?.sub_category]);

  // Calculate expiry date based on validity_days
  const calculateExpiryDate = (validityDays) => {
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + (validityDays || 0));

    // Return only the date portion in YYYY-MM-DD format
    return expiryDate.toISOString().split("T")[0];
  };

  // Get the current user ID from localStorage
  const getCurrentUserID = () => {
    try {
      // Check if user data exists in localStorage
      const userData = localStorage.getItem("userInfo");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        // Return user ID from the userData object
        // Adjust the property name based on how your user data is structured
        return (
          parsedUserData.id || parsedUserData.user_id || parsedUserData._id
        );
      }

      // Alternatively, check for a JWT token and decode it to get user ID
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

  // Handle enrollment API call - Updated to use authenticated user ID
  // Handle enrollment - Redirects to payment page
  const handleEnrollment = async () => {
    try {
      setEnrolling(true);

      // Get the current user ID
      const userId = getCurrentUserID();

      if (!userId) {
        // No user ID found, user might not be logged in
        setSnackbar({
          open: true,
          message:
            "You need to be logged in to enroll in this course. Redirecting to login...",
          severity: "warning",
        });

        // Redirect to login page after a short delay
        setTimeout(() => {
          // Save course info to redirect back after login
          localStorage.setItem(
            "pendingEnrollment",
            JSON.stringify({
              courseId: course.id || id,
              courseTitle: course.course_title,
            })
          );
          navigate("/login", {
            state: { from: `/course-details/${course.id || id}` },
          });
        }, 2000);

        setEnrolling(false);
        return;
      }

      // Prepare enrollment data with calculated expiry date
      const enrollmentData = {
        user_id: userId,
        course_id: course.id || id,
        enrolled_date: new Date().toISOString().split("T")[0], // Also fix this for consistency
        expiry_date: calculateExpiryDate(course.validity_days),
        status: "active",
        // Other fields...
      };

      // Make API call to enrollment endpoint
      const response = await axios.post(
        `${baseurl}/api/enrollment/add`,
        enrollmentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include auth token if required
          },
        }
      );

      // Handle successful enrollment
      setSnackbar({
        open: true,
        message: "Successfully enrolled in the course!",
        severity: "success",
      });

      // Store enrollment data in localStorage for future reference
      const enrollmentInfo = {
        ...enrollmentData,
        enrollment_id: response.data.id || response.data.enrollment_id,
        course_title: course.course_title,
        course_image: course.course_image,
      };

      // Get existing enrollments or initialize empty array
      const existingEnrollments = JSON.parse(
        localStorage.getItem("enrollments") || "[]"
      );
      existingEnrollments.push(enrollmentInfo);
      localStorage.setItem("enrollments", JSON.stringify(existingEnrollments));

      // Redirect to course content page
      setTimeout(() => {
        navigate(`/coursecontent/${course.id}`, {
          state: {
            course: course,
            enrollment: enrollmentInfo,
          },
        });
      }, 2000);
    } catch (err) {
      console.error("Error enrolling in course:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          "Failed to enroll in course. Please try again.",
        severity: "error",
      });
    } finally {
      setEnrolling(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <>
        <Navbar transparent={true} />
        <Container
          maxWidth="lg"
          sx={{
            py: 8,
            minHeight: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">Loading course details...</Typography>
        </Container>
        <Footer />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Navbar transparent={true} />
        <Container
          maxWidth="lg"
          sx={{
            py: 8,
            minHeight: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" color="error">
            {error || "Course not found"}
          </Typography>
        </Container>
        <Footer />
      </>
    );
  }

  // Course lessons
  const lessons =
    course.Lessions && Array.isArray(course.Lessions) ? course.Lessions : [];

  // Course features
  const features = [
    `${lessons.length} Lessons`,
    `${course.course_level} Level`,
    "Accessible in Mobile & Desktop",
    "Certification on Completion",
  ];

  // Generate a preview image from the video if needed
  const thumbnailUrl =
    course.course_image ||
    "https://via.placeholder.com/640x360?text=Preview+Thumbnail";

  // Handle video click
  const handleVideoClick = () => {
    setShowVideo(true);
  };

  return (
    <>
      <Navbar transparent={true} />

      {/* Main Content */}
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pt: 2, pb: 6 }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator="/"
            aria-label="breadcrumb"
            sx={{ mb: 3, color: "#666" }}
          >
            <Link to="/" style={{ textDecoration: "none", color: "#666" }}>
              Home
            </Link>
            <Typography color="#0000FF">
              {course.course_title || "Investor Pitch Deck"}
            </Typography>
          </Breadcrumbs>

          {/* Course Details Grid */}
          <Grid container spacing={4}>
            {/* Left Column - Course Info */}
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  bgcolor: "white",
                  p: 3,
                  borderRadius: 2,
                  mb: 4,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  variant="h5"
                  component="h1"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  {course.course_title ||
                    "Investor Presentation & Pitching For Startup Fundraising"}
                </Typography>

                {/* Rating Stars */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Rating
                          name={`rating-${course.id}`}
                          value={calculateAverageRating(course.Ratings)}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                  <Typography variant="body2" sx={{ ml: 0.5, color: "#666" }}>
                    ({Math.floor(Math.random() * 500) + 100})
                  </Typography>
                </Box>

                {/* Course Info Icons */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <MenuBookIcon
                      sx={{ color: "#0000FF", mr: 0.5, fontSize: 20 }}
                    />
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      {lessons.length || 6} lessons
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTimeIcon
                      sx={{ color: "#0000FF", mr: 0.5, fontSize: 20 }}
                    />
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      {course.time_spend || "2 Hours"}
                    </Typography>
                  </Box>
                </Box>

                {/* Preview Video */}
                <Box
                  sx={{
                    position: "relative",
                    height: 250,
                    mb: 4,
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  {showVideo ? (
                    <video
                      controls
                      autoPlay
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                       onContextMenu={(e) => e.preventDefault()}
                          controlsList="nodownload"
                    >
                      <source
                        src={`${baseurl}/${course.preview_video}`}
                        type="video/mp4"
                       
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <>
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                          backgroundColor: "#f0f0f0", // Fallback background color
                          "&:hover": {
                            opacity: 0.9,
                          },
                        }}
                        onClick={handleVideoClick}
                      >
                        {/* Image with error handling */}
                        <img
                          src={
                            course.course_image.startsWith("http")
                              ? course.course_image
                              : `${baseurl}/${course.course_image}`
                          }
                          alt="Course Preview"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />

                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            bgcolor: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
                            transition: "transform 0.2s",
                            zIndex: 2,
                            "&:hover": {
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <PlayCircleOutlineIcon
                            sx={{ color: "#FF4081", fontSize: 36 }}
                          />
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          position: "absolute",
                          bottom: 16,
                          left: 0,
                          right: 0,
                          color: "white",
                          fontWeight: "medium",
                          textAlign: "center",
                          textShadow: "0px 1px 3px rgba(0,0,0,0.7)",
                        }}
                      >
                        Preview this Course
                      </Typography>
                    </>
                  )}
                </Box>

                {/* About This Course */}
                <Typography
                  variant="h5"
                  component="h2"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  About this Course
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: 4, color: "#444", lineHeight: 1.7 }}
                >
                  {course.course_description}
                </Typography>

                {/* Course Validity */}
                <Typography
                  variant="h5"
                  component="h2"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Course Validity
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: 4, color: "#444", lineHeight: 1.7 }}
                >
                  This course will be accessible for{" "}
                  {course.validity_days || 30} days after enrollment.
                </Typography>

                {/* What You'll Learn */}
                <Typography
                  variant="h5"
                  component="h2"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Requirement or Prerequisites
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: 4, color: "#444", lineHeight: 1.7 }}
                >
                  {course.course_requirements}
                </Typography>

                {/* Course Content */}
                {lessons.length > 0 && (
                  <>
                    <Typography
                      variant="h5"
                      component="h2"
                      fontWeight="bold"
                      sx={{ mb: 2 }}
                    >
                      Course Content
                    </Typography>
                    <Card
                      variant="outlined"
                      sx={{
                        mb: 4,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "none",
                      }}
                    >
                      {[...lessons]
                        .sort((a, b) => a.lession_order - b.lession_order)
                        .map((lesson, index) => (
                          <Box
                            key={lesson.lession_order}
                            sx={{
                              borderBottom:
                                index < lessons.length - 1
                                  ? "1px solid #eee"
                                  : "none",
                              bgcolor: index === 0 ? "#f0f7ff" : "transparent",
                              py: 1,
                            }}
                          >
                            <Box sx={{ px: 2, py: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{ color: "#444", mb: 0.5 }}
                              >
                                Lesson {lesson.lession_order}
                              </Typography>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 500,
                                  color: index === 0 ? "#0000FF" : "inherit",
                                }}
                              >
                                {lesson.lession_title}
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 1,
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    mr: 1,
                                    color: "#444",
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: "50%",
                                      bgcolor: "#0000FF",
                                      display: "inline-flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      mr: 1,
                                      fontSize: 14,
                                      color: "white",
                                    }}
                                  >
                                    {lesson.content_type === "Video"
                                      ? "V"
                                      : "Q"}
                                  </Box>
                                  {lesson.content_type === "Video"
                                    ? "Video"
                                    : "Quiz"}
                                </Box>

                                {lesson.duration && (
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#666", ml: 2 }}
                                  >
                                    Duration:{" "}
                                    {lesson.duration
                                      ? `${lesson.duration}:00`
                                      : "0:00"}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        ))}
                    </Card>
                  </>
                )}
              </Box>
            </Grid>

            {/* Right Column - Course Info & Enroll */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  bgcolor: "white",
                  p: 3,
                  borderRadius: 2,
                  mb: 4,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  fontWeight="bold"
                  sx={{ mb: 3 }}
                >
                  About this Course
                </Typography>

                <List disablePadding>
                  {features.map((feature, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {index === 0 ? (
                          <MicIcon sx={{ color: "#0000FF" }} />
                        ) : index === 2 ? (
                          <SignalCellularAltIcon sx={{ color: "#0000FF" }} />
                        ) : index === 3 ? (
                          <LaptopIcon sx={{ color: "#0000FF" }} />
                        ) : (
                          <VerifiedUserIcon sx={{ color: "#0000FF" }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "#444",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ my: 4 }}>
                  <Typography
                    variant="h4"
                    component="p"
                    fontWeight="bold"
                    sx={{ textAlign: "center", mb: 2 }}
                  >
                    ₹ {course.course_price}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <AnimatedButton
                      buttonText={enrolling ? "ENROLLING..." : "ENROLL NOW"}
                      onClick={handleEnrollment}
                      disabled={enrolling}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </>
  );
};

export default CourseDetails;

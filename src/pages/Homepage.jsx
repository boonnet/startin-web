import React from 'react'
import '../App.css'
import {
  Box, Typography, Divider, Container, useTheme, useMediaQuery, Grid, Card, CardContent, CardMedia, Chip, Stack, Checkbox, Avatar, Rating, IconButton, Button
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import homeimg from '../assets/homeimg.png'
import { Rocket, Users } from 'lucide-react';
import AnimatedButton from '../components/Button'
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import leftpng from '../assets/left.png'
import centerpng from '../assets/center.png'
import rightpng from '../assets/right.png'
import loginbg from '../assets/loginbg.png'
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import computerpng from '../assets/computer.png'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import baseurl from '../ApiService/ApiService';
import axios from 'axios';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DescriptionIcon from '@mui/icons-material/Description';

const Homepage = () => {
  const navigate = useNavigate()
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [activeSlide, setActiveSlide] = useState(0);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState(null);

  const BlueEllipse = styled(Box)(({ theme }) => ({
    position: 'absolute',
    width: '440px',
    height: '440px',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: '50%',
    backgroundColor: '#0133DC',
    zIndex: 1,
    [theme.breakpoints.down('lg')]: {
      width: '360px',
      height: '360px',
    },
    [theme.breakpoints.down('md')]: {
      width: '280px',
      height: '280px',
      right: '-100px',
    },
    [theme.breakpoints.down('sm')]: {
      width: '200px',
      height: '200px',
      right: '-50px',
    },
  }));

  const PinkEllipse = styled(Box)(({ theme }) => ({
    position: 'absolute',
    width: '240px',
    height: '240px',
    left: '10px',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: '50%',
    backgroundColor: '#FF52F8',
    zIndex: 1,
    [theme.breakpoints.down('lg')]: {
      width: '200px',
      height: '200px',
    },
    [theme.breakpoints.down('md')]: {
      width: '160px',
      height: '160px',
    },
    [theme.breakpoints.down('sm')]: {
      width: '120px',
      height: '120px',
    },
  }));

  const StatBox = styled(Box)(({ theme, position }) => ({
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
    position: 'absolute',
    zIndex: 3,
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
    ...(position === 'top' && {
      top: '342px',
      right: '290px',
      [theme.breakpoints.down('lg')]: {
        top: '300px',
        right: '200px',
      },
      [theme.breakpoints.down('md')]: {
        top: '250px',
        right: '150px',
      },
      [theme.breakpoints.down('sm')]: {
        top: '200px',
        right: '80px',
        padding: '10px 15px',
      },
    }),
    ...(position === 'bottom' && {
      top: '180px',
      right: '-70px',
      [theme.breakpoints.down('lg')]: {
        top: '150px',
        right: '0px',
      },
      [theme.breakpoints.down('md')]: {
        top: '120px',
        right: '-60px',
      },
      [theme.breakpoints.down('sm')]: {
        top: '100px',
        right: '-40px',
        padding: '10px 15px',
      },
    }),
  }));

  const IconWrapper = styled(Box)(({ theme }) => ({
    borderRadius: '12px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: '8px',
    },
  }));

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

  // Handle buy now button click for templates
  const handleTemplateBuyNow = (template, event) => {
    event.stopPropagation(); // Prevent card click event
    navigate(`/template/${template.id}`, { state: { template } });
  };

  const cardData = [
    {
      title: "Quality Education",
      description: "Morem ipsum dolor sit amet, consectetur adipiscing elit.",
      id: "quality"
    },
    {
      title: "Learn more Anywhere",
      description: "Morem ipsum dolor sit amet, consectetur adipiscing elit.",
      id: "learn"
    },
    {
      title: "Free Trial Courses",
      description: "Morem ipsum dolor sit amet, consectetur adipiscing elit.",
      id: "free"
    }
  ];

  const [courses, setCourses] = useState([]);
  const [ratings, setRatings] = useState({});

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);
  const [enrolledTemplates, setEnrolledTemplates] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState([]);

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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check if course is favorited
  const isCourseFavorite = (courseId) => {
    return favoriteCourses.some(id => id && courseId && id.toString() === courseId.toString());
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setCoursesLoading(true);
        setTemplatesLoading(true);

        // Fetch courses
        const courseResponse = await axios.get(`${baseurl}/api/course/all`);
        if (courseResponse.data && Array.isArray(courseResponse.data.courses)) {
          setFeaturedCourses(courseResponse.data.courses);
        }
        setCoursesLoading(false);

        // Fetch templates
        const templateResponse = await axios.get(`${baseurl}/api/templates/all`);
        if (templateResponse.data && Array.isArray(templateResponse.data.templates)) {
          setTemplates(templateResponse.data.templates);
        }
        setTemplatesLoading(false);

        // Get current user ID
        const userId = getCurrentUserID();

        // Fetch enrollments (for both courses & templates)
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

              // Extract template IDs from user enrollments
              const enrolledTemplateIds = userEnrollments
                .filter(enrollment => enrollment.template_id ||
                  (enrollment.Template && enrollment.Template.id))
                .map(enrollment => enrollment.template_id ||
                  (enrollment.Template && enrollment.Template.id));

              setEnrolledTemplates(enrolledTemplateIds);

              // Extract course IDs from user enrollments
              const enrolledCourseIds = userEnrollments
                .filter(enrollment => enrollment.course_id ||
                  (enrollment.Course && enrollment.Course.id))
                .map(enrollment => enrollment.course_id ||
                  (enrollment.Course && enrollment.Course.id));

              setEnrolledCourses(enrolledCourseIds);
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

              setFavoriteCourses(favoriteCourseIds);;

              // Extract favorite template IDs
              const favoriteTemplateIds = userFavorites
                .filter(favorite => favorite.template_id)
                .map(favorite => favorite.template_id);

              setFavoriteTemplates(favoriteTemplateIds);
            }
          } catch (err) {
            console.error("Error fetching favorites:", err);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.message.includes("course")) {
          setCoursesError("Failed to load courses. Please try again later.");
          setCoursesLoading(false);
        }
        if (err.message.includes("templates")) {
          setTemplatesError("Failed to load templates. Please try again later.");
          setTemplatesLoading(false);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setRatingsLoading(true);
        const response = await axios.get(`${baseurl}/api/rating/all`);
        if (response.data) {
          setRatings(response.data);
        }
        setRatingsLoading(false);
      } catch (error) {
        console.error("Error fetching ratings:", error);
        setRatingsError("Failed to load ratings. Please try again later.");
        setRatingsLoading(false);
      }
    };

    fetchRatings();
  }, []);

  const isCourseEnrolled = (courseId) => {
    // Convert to string for comparison if needed
    return enrolledCourses.some(id => id && courseId && id.toString() === courseId.toString());
  };

  // Handle buy now button click for courses
  const handleCourseBuyNow = (course, event) => {
    event.stopPropagation(); // Prevent card click event
    navigate(`/course/${course.id}`, { state: { course } });
  };

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


  const features = [
    'Morem Ipsum Dolor Sit Amet',
    'Morem Ipsum Dolor Sit Amet',
    'Morem Ipsum Dolor Sit Amet',
    'Morem Ipsum Dolor Sit Amet',
  ];

  const items = ["Morem Ipsum Dolor Sit Amet", "Morem Ipsum Dolor Sit Amet"];

  const testimonials = [
    {
      id: 1,
      text: "Fusce volutpat lectus et nisl consectetur finibus. In vitae scelerisque augue, in varius eros. Nunc sapien diam, euismod et pretium id, volutpat et tortor. In vulputate lorem quis dui vestibulum.",
      author: "John Doe",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=32"
    },
    {
      id: 2,
      text: "Fusce volutpat lectus et nisl consectetur finibus. In vitae scelerisque augue, in varius eros. Nunc sapien diam, euismod et pretium id, volutpat et tortor. In vulputate lorem quis dui vestibulum.",
      author: "John Doe",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=32"
    },
    {
      id: 3,
      text: "Fusce volutpat lectus et nisl consectetur finibus. In vitae scelerisque augue, in varius eros. Nunc sapien diam, euismod et pretium id, volutpat et tortor. In vulputate lorem quis dui vestibulum.",
      author: "John Doe",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=32"
    }
  ];

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Function to calculate average rating
  const calculateAverageRating = (ratings) => {
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return "N/A"; // Return "N/A" if there are no ratings
    const total = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (total / ratings.length).toFixed(1); // Return average rounded to 1 decimal place
  };

  return (
    <>
      <Navbar transparent={true} />
      {/* Section 1 */}
      <Box sx={{ width: '100%', }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            overflow: 'none',
            background: `url(${loginbg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: { xs: '400px', md: '600px' },
              position: 'relative',
              py: { xs: 4, md: 8 },
              gap: { xs: 4, md: 0 },
              maxWidth: 'lg',
              mx: 'auto',
            }}
          >
            {/* Left Content */}
            <Box
              sx={{
                maxWidth: '550px',
                zIndex: 2,
                px: { xs: 2, md: 0 },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '32px', sm: '40px', md: '48px' },
                  fontWeight: 'bold',
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Unlock your startup's potential with premier{' '}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(to right, #0133DC, #FF52F8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: "bold",
                  }}
                >
                  fundraising
                </Box>{' '}
                strategies.
              </Typography>

              <AnimatedButton buttonText="EXPLORE NOW" onClick={() => navigate('/')} />
            </Box>

            {/* Right Content */}
            <Box
              sx={{
                position: 'relative',
                width: { xs: '300px', sm: '400px', md: '500px' },
                height: { xs: '300px', sm: '400px', md: '500px' },
                mt: { xs: 4, md: 0 },
              }}
            >
              <BlueEllipse />
              <PinkEllipse />

              {/* Stats Boxes */}
              <StatBox position="top">
                <IconWrapper>
                  <Rocket
                    color='#00FFD1'
                    width={isMobile ? '30px' : '50px'}
                    height={isMobile ? '30px' : '50px'}
                  />
                </IconWrapper>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '20px', sm: '24px', md: '28px' },
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    100+
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: { xs: '12px', sm: '14px', md: '16px' }
                    }}
                  >
                    Entrepreneurs
                  </Typography>
                </Box>
              </StatBox>

              <StatBox position="bottom">
                <IconWrapper>
                  <Users
                    color='#00FFD1'
                    width={isMobile ? '30px' : '50px'}
                    height={isMobile ? '30px' : '50px'}
                  />
                </IconWrapper>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '20px', sm: '24px', md: '28px' },
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    15+
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: { xs: '12px', sm: '14px', md: '16px' }
                    }}
                  >
                    Courses
                  </Typography>
                </Box>
              </StatBox>

              {/* Hero Image */}
              <Box
                component="img"
                src={homeimg}
                alt="Fundraising Team"
                sx={{
                  position: 'absolute',
                  top: '38%',
                  right: { xs: '-4px', md: '-8px' },
                  left: { xs: '20px', md: '0px' },
                  transform: 'translateY(-50%)',
                  width: '100%',
                  height: '100%',
                  zIndex: 2,
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>
      {/* Section 2 */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{
          display: 'flex',
          width: '100%',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {cardData.map((card, index) => (
            <React.Fragment key={card.id}>
              <Box sx={{
                flex: 1,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: isMobile ? 2 : 0
              }}>
                <Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      fontSize: isMobile ? '1.1rem' : isTablet ? '1.3rem' : '1.5rem'
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}
                  >
                    {card.description}
                  </Typography>
                </Box>
                <AnimatedButton
                  buttonText="EXPLORE NOW"
                  onClick={() => navigate('/')}
                />
              </Box>
              {!isMobile && index < cardData.length - 1 && (
                <Divider orientation="vertical" flexItem />
              )}
              {isMobile && index < cardData.length - 1 && (
                <Divider sx={{ width: '100%', my: 2 }} />
              )}
            </React.Fragment>
          ))}
        </Box>
      </Container>
      {/* Section 3 */}
      <Box sx={{ backgroundColor: '#f8f9fb' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {/* Left Side - Images (hidden on mobile) */}
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                height: { xs: 'auto', md: '100%' },
                gap: { xs: 2, sm: 1 },
                mb: { xs: 2, md: 0 }
              }}>
                {/* First panel */}
                <Box sx={{
                  width: { xs: '100%', sm: '33%' },
                  height: { xs: 200, sm: 'auto' },
                  position: 'relative',
                  borderRadius: 2,
                  mb: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Box component="img" src={leftpng} alt="Financial chart overlay"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 2,
                          opacity: 0.9,
                          filter: 'brightness(1.5) contrast(1.2)',
                          position: 'relative',
                          zIndex: 1
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Middle panel */}
                <Box sx={{
                  width: { xs: '100%', sm: '33%' },
                  height: { xs: 150, sm: 'auto' },
                  position: 'relative',
                  borderRadius: 2,
                  mb: { xs: 2, sm: 0 },
                  mx: { sm: 1 }
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: '40px',
                    left: 0,
                    width: '100%',
                    height: '85%',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Box component="img" src={centerpng} alt="Person with glasses overlay"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 2,
                          opacity: 0.9,
                          filter: 'brightness(1.5) contrast(1.2)',
                          position: 'relative',
                          zIndex: 1
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Right panel */}
                <Box sx={{
                  width: { xs: '100%', sm: '33%' },
                  height: { xs: 200, sm: 'auto' },
                  position: 'relative',
                  borderRadius: 2
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Box component="img" src={rightpng} alt="Financial graph overlay"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 2,
                          opacity: 0.9,
                          filter: 'brightness(1.5) contrast(1.2)',
                          position: 'relative',
                          zIndex: 1
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right Side - Content (takes full width on mobile) */}
            <Grid item xs={12} md={7}>
              <Box sx={{ pl: { md: 4 }, mt: { xs: 0, md: 2 } }}>
                {/* Headline */}
                <Typography variant="h2" component="h1" sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                  lineHeight: { xs: 1.2, md: 1.3 }
                }}>
                  Learn New Skills To
                </Typography>
                <Typography variant="h2" component="div" sx={{
                  fontWeight: 700,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                  lineHeight: { xs: 1.2, md: 1.3 }
                }}>
                  Go Ahead For Your Career
                </Typography>

                {/* Subtitle */}
                <Typography variant="body1" sx={{
                  mb: { xs: 3, md: 4 },
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
                </Typography>

                {/* Mission Card */}
                <Card elevation={0} sx={{
                  mb: { xs: 2, md: 3 },
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  <CardContent sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    p: { xs: 2, sm: 3 }
                  }}>
                    <Box sx={{
                      width: { xs: 60, sm: 100 },
                      height: { xs: 60, sm: 60 },
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 255, 204, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: { xs: 0, sm: 2 },
                      mb: { xs: 2, sm: 0 }
                    }}>
                      <StarIcon sx={{ color: '#00FFCC', fontSize: { xs: 24, sm: 28 } }} />
                    </Box>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="h5" component="h3" sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}>
                        Our Mission
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Vision Card */}
                <Card elevation={0} sx={{
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  <CardContent sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    p: { xs: 2, sm: 3 }
                  }}>
                    <Box sx={{
                      width: { xs: 60, sm: 100 },
                      height: { xs: 60, sm: 60 },
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 255, 204, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: { xs: 0, sm: 2 },
                      mb: { xs: 2, sm: 0 }
                    }}>
                      <VisibilityIcon sx={{ color: '#00FFCC', fontSize: { xs: 24, sm: 28 } }} />
                    </Box>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="h5" component="h3" sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}>
                        Our Vision
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Section 4 */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              color: '#0133DC',
              fontWeight: 600,
              fontSize: '16px',
              mb: 1,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                height: '1px',
                width: '80px',
                backgroundColor: '#0133DC',
                top: '50%',
                left: '110%',
              }
            }}
          >
            POPULAR COURSES
          </Typography>

          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 5, fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Our Top Courses
          </Typography>

          {coursesLoading && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              Loading courses...
            </Typography>
          )}

          {coursesError && (
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {coursesError}
            </Typography>
          )}

          {!coursesLoading && featuredCourses.length === 0 && !coursesError && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              No courses available at the moment.
            </Typography>
          )}

          {!coursesLoading && featuredCourses.length > 0 && (
            <Grid container spacing={3}>
              {featuredCourses.slice(0, 3).map((course, index) => (
                <Grid item xs={12} md={4} key={course.id || index}>
                  <CourseCard
                    onClick={() => handleCourseClick(course)}
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
                        {/* <Typography variant="body2" sx={{ ml: 0.5, color: '#6a6f73' }}>
                          ({Math.floor(Math.random() * 500) + 100})
                        </Typography> */}
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

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          ₹ {course.course_price || "Free"}
                        </Typography>

                        {isCourseEnrolled(course.id) ? (
                          <Button
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            color="success"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/coursecontent/${course.id}`, { state: { course } });
                            }}
                          >
                            Enrolled
                          </Button>
                        ) : (
                          <Button
                            sx={{ backgroundColor: "#0133dc" }}
                            variant="contained"
                            startIcon={<ShoppingCartIcon />}
                            size="small"
                            onClick={(e) => handleCourseBuyNow(course, e)}
                          >
                            Buy Now
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </CourseCard>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <AnimatedButton buttonText="VIEW ALL COURSES" onClick={() => navigate('/Courses')} />
          </Box>
        </Box>
      </Container>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              color: '#0133DC',
              fontWeight: 600,
              fontSize: '16px',
              mb: 1,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                height: '1px',
                width: '80px',
                backgroundColor: '#0133DC',
                top: '50%',
                left: '110%',
              }
            }}
          >
            POPULAR Templates
          </Typography>

          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 5, fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Our Top Templates
          </Typography>

          {templatesLoading && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              Loading Templates...
            </Typography>
          )}

          {templatesError && (
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {templatesError}
            </Typography>
          )}

          {!templatesLoading && templates.length === 0 && !templatesError && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              No Templates available at the moment.
            </Typography>
          )}

          {!templatesLoading && templates.length > 0 && (
            <Grid container spacing={3}>
              {templates.slice(0, 3).map((template, index) => { // Limit to 3 templates
                // Parse files if it's a JSON string
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

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DescriptionIcon sx={{ color: '#6a6f73', fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: '#6a6f73' }}>
                              <Box component="span" sx={{ color: '#374151', mr: 0.5, fontWeight: 500 }}>
                                {filesArray.length || 0}
                              </Box>
                              {filesArray.length === 1 ? 'File' : 'Files'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            ₹ {template.price || "Free"}
                          </Typography>

                          {isTemplateEnrolled(template.id) ? (
                            <Button
                              variant="contained"
                              startIcon={<CheckCircleIcon />}
                              color="success"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/template/${template.id}`, { state: { template } });
                              }}
                            >
                              Enrolled
                            </Button>
                          ) : (
                            <Button
                              sx={{ backgroundColor: "#0133dc" }}
                              variant="contained"
                              startIcon={<ShoppingCartIcon />}
                              size="small"
                              onClick={(e) => handleTemplateBuyNow(template, e)}
                            >
                              Buy Now
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </CourseCard>
                  </Grid>
                );
              })}
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <AnimatedButton buttonText="VIEW ALL Templates" onClick={() => navigate('/Templates')} />
          </Box>
        </Box>
      </Container>

      {/* Section 5 */}
      <Container sx={{ maxWidth: '1200px !important' }} maxWidth={false}>
        <Box sx={{ display: "flex", flexDirection: "column", py: 6 }}>
          {/* Container for left-aligned header elements */}
          <Box sx={{ alignItems: 'flex-start', mb: 4, width: "100%" }}>
            {/* "Just Launched" Text with line */}
            <Box sx={{ position: 'relative', mb: 1, display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="overline"
                component="div"
                sx={{
                  color: '#0133DC',
                  fontWeight: 600,
                  fontSize: { xs: '12px', sm: '14px', md: '16px' },
                  letterSpacing: '1px',
                }}
              >
                JUST LAUNCHED
              </Typography>
              <Box
                sx={{
                  width: '80px',
                  height: '1px',
                  backgroundColor: '#0133DC',
                  ml: 1,
                  display: { xs: 'none', md: 'block' }
                }}
              />
            </Box>

            {/* Heading - Left aligned */}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                textAlign: "left",
                fontSize: { xs: '28px', sm: '34px' }
              }}
            >
              Brand-New Learning Tracks
            </Typography>
          </Box>

          {/* Two columns of checkboxes - Center aligned */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 6 }}
              sx={{
                justifyContent: "center",
                mb: 4,
                width: '100%',
                maxWidth: '600px'
              }}
            >
              {/* Left column */}
              <Stack direction="column" spacing={2} sx={{ width: { xs: '100%', sm: '50%' } }}>
                {items.map((label, index) => (
                  <Box key={`left-${index}`} sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked
                      disableRipple
                      sx={{
                        color: '#0052cc',
                        '&.Mui-checked': {
                          color: '#0052cc',
                        },
                        padding: '4px',
                        marginRight: '8px'
                      }}
                    />
                    <Typography sx={{ fontSize: '14px' }}>{label}</Typography>
                  </Box>
                ))}
              </Stack>

              {/* Right column */}
              <Stack direction="column" spacing={2} sx={{ width: { xs: '100%', sm: '50%' } }}>
                {items.map((label, index) => (
                  <Box key={`right-${index}`} sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked
                      disableRipple
                      sx={{
                        color: '#0052cc',
                        '&.Mui-checked': {
                          color: '#0052cc',
                        },
                        padding: '4px',
                        marginRight: '8px'
                      }}
                    />
                    <Typography sx={{ fontSize: '14px' }}>{label}</Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>

            {/* Subscribe Text */}
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                mb: 3,
                fontSize: '14px'
              }}
            >
              Subscribe to get a full updates about the Courses
            </Typography>

            {/* Subscribe Button */}
            <AnimatedButton buttonText="Subscribe" onClick={() => navigate()} />
          </Box>
        </Box>
      </Container>

      {/* Section 7 */}
      <Box sx={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <Box sx={{ marginBottom: 5 }}>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              color: '#0133DC',
              fontWeight: 600,
              fontSize: '16px',
              marginBottom: 0.5,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            TESTIMONIAL
            <Box
              sx={{
                width: '100px',
                height: '1px',
                backgroundColor: '#0133DC',
                ml: 2,
                display: 'inline-block'
              }}
            />
          </Typography>

          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '28px', md: '40px' }
            }}
          >
            Stories Of Impact And Generosity
          </Typography>
        </Box>

        {/* Navigation Buttons - Aligned to the right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
          <IconButton
            sx={{
              backgroundColor: '#FFD6F5',
              borderRadius: '50%',
              '&:hover': { backgroundColor: '#FAB3F7' },
              width: 35,
              height: 35
            }}
            onClick={handlePrev}
          >
            <ArrowBackIosNewIcon sx={{ color: '#fff' }} />
          </IconButton>
          <IconButton
            sx={{
              backgroundColor: '#FFD6F5',
              borderRadius: '50%',
              '&:hover': { backgroundColor: '#FAB3F7' },
              width: 35,
              height: 35
            }}
            onClick={handleNext}
          >
            <ArrowForwardIosIcon sx={{ color: '#fff' }} />
          </IconButton>
        </Box>

        {/* Testimonial Cards */}
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between'
          }}
        >
          {ratingsLoading && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              Loading testimonials...
            </Typography>
          )}

          {ratingsError && (
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {ratingsError}
            </Typography>
          )}

          {!ratingsLoading && ratings.length === 0 && !ratingsError && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              No testimonials available at the moment.
            </Typography>
          )}

          {!ratingsLoading && ratings.length > 0 && (
            ratings.map((rating) => (
              <Card
                key={rating.id}
                sx={{
                  padding: { xs: 3, md: 4 },
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  borderRadius: 4,
                  position: 'relative',
                  flex: 1,
                  margin: '28px 0',
                  overflow: 'visible',
                  pt: 6 // Added top padding to accommodate avatar
                }}
              >
                {/* Left Quote Icon - Turquoise, positioned top left */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: 20,
                    backgroundColor: '#00FFE0',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '18px',
                    rotate: '180deg'
                  }}
                >
                  <FormatQuoteIcon />
                </Box>

                {/* Avatar - Positioned at top center, partially overlapping the card */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      border: '4px solid #00FFE0',
                    }}
                    src={rating.User.profile_image}
                    alt={rating.User.username}
                  />
                </Box>

                {/* Testimonial Text */}
                <Typography
                  variant="body1"
                  sx={{
                    mt: 3,
                    mb: 3,
                    textAlign: 'center',
                    lineHeight: 1.6,
                    color: '#333'
                  }}
                >
                  {rating.review}
                </Typography>

                {/* Name and Rating */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, }}>
                  <Typography
                    variant="subtitle1"
                    component="p"
                    sx={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#333',
                    }}
                  >
                    {rating.User.username}
                  </Typography>
                  <Rating
                    value={rating.rating}
                    readOnly
                    sx={{
                      color: '#FFD700',
                      '& .MuiRating-iconFilled': {
                        color: '#FFD700',
                      }
                    }}
                  />
                </Box>

                {/* Right Quote Icon - Turquoise, positioned bottom right */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -15,
                    right: 20,
                    backgroundColor: '#00FFE0',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '18px',
                    transform: 'rotate(-360deg)'
                  }}
                >
                  <FormatQuoteIcon />
                </Box>
              </Card>
            ))
          )}
        </Box>
      </Box>
      <Footer />
    </>
  )
}

export default Homepage
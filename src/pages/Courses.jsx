import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Box,
  Grid,
  Typography,
  Container,
  Breadcrumbs,
  Link,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip,
  Divider,
  Rating
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import StarIcon from "@mui/icons-material/Star";
import DescriptionIcon from '@mui/icons-material/Description';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import computer from "../assets/computer.png";
import AnimatedButton from "../components/Button";
import CheckIcon from "@mui/icons-material/Check";
import baseurl from "../ApiService/ApiService";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Styled components for the circles
const Circle = styled(Box)(
  ({ theme, size = 60, color = "#B5CCFF", top, left, right, bottom }) => ({
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: color,
    opacity: 0.6,
    top,
    left,
    right,
    bottom,
    zIndex: 1,
  })
);

// Styled component for category tabs
const CategoryTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minWidth: 'auto',
  padding: '12px 20px',
  color: '#1c1d1f',
  '&.Mui-selected': {
    color: '#1c1d1f',
    borderBottom: '2px solid #1c1d1f',
  }
}));

// Styled component for subcategory cards
const SubcategoryCard = styled(Box)(({ theme, active }) => ({
  padding: '16px',
  textAlign: 'center',
  backgroundColor: active ? '#f7f9fa' : 'white',
  borderRadius: '8px',
  minWidth: '120px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: active ? '1px solid #6a6f73' : '1px solid transparent',
  '&:hover': {
    backgroundColor: '#f7f9fa',
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

const Courses = () => {
  const navigate = useNavigate();
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

  // New state for categories and subcategories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to calculate average rating
  const calculateAverageRating = (ratings) => {
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return 0; // Return 0 if there are no ratings
    const total = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (total / ratings.length).toFixed(1); // Return average rounded to 1 decimal place
  };

  // Get the current user ID from localStorage
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
      }

      return null;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  };

  const userId = getCurrentUserID();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCoursesLoading(true);
        setTemplatesLoading(true);

        // Fetch courses
        const courseResponse = await axios.get(`${baseurl}/api/course/all`);
        if (courseResponse.data && Array.isArray(courseResponse.data.courses)) {
          setFeaturedCourses(courseResponse.data.courses);

          // Extract unique categories and subcategories
          const uniqueCategories = [...new Set(courseResponse.data.courses.map(course => course.parent_category))];

          // Create category structure with subcategories
          const categoryData = [
            // Add "All" category first
            {
              name: "All",
              subcategories: [{
                name: "All Courses",
                courses: courseResponse.data.courses
              }]
            },
            // Then add other categories
            ...uniqueCategories.map(category => {
              const coursesInCategory = courseResponse.data.courses.filter(
                course => course.parent_category === category
              );

              const subcategories = [...new Set(coursesInCategory.map(course => course.sub_category))];

              return {
                name: category,
                subcategories: subcategories.map(sub => ({
                  name: sub,
                  courses: coursesInCategory.filter(course => course.sub_category === sub)
                }))
              };
            })
          ];

          setCategories(categoryData);

          // Set default filtered courses (All courses initially)
          setFilteredCourses(courseResponse.data.courses);
          setSelectedSubcategory("All Courses");
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

              // Extract template IDs from user enrollments
              const enrolledTemplateIds = userEnrollments
                .filter(enrollment => enrollment.template_id ||
                  (enrollment.Template && enrollment.Template.id))
                .map(enrollment => enrollment.template_id ||
                  (enrollment.Template && enrollment.Template.id));

              setEnrolledTemplates(enrolledTemplateIds);
              console.log("Current user enrolled templates:", enrolledTemplateIds);

              // Extract course IDs from user enrollments
              const enrolledCourseIds = userEnrollments
                .filter(enrollment => enrollment.course_id ||
                  (enrollment.Course && enrollment.Course.id))
                .map(enrollment => enrollment.course_id ||
                  (enrollment.Course && enrollment.Course.id));

              setEnrolledCourses(enrolledCourseIds);
              console.log("Current user enrolled courses:", enrolledCourseIds);
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

  // Handle category change
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    if (categories[newValue] && categories[newValue].subcategories.length > 0) {
      setSelectedSubcategory(categories[newValue].subcategories[0].name);
      setFilteredCourses(categories[newValue].subcategories[0].courses);
    }else {
      setSelectedSubcategory(null);
      setFilteredCourses([]);
    }
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    const currentCategory = categories[selectedCategory];
    const subcategoryData = currentCategory.subcategories.find(sub => sub.name === subcategory);
    if (subcategoryData) {
      setFilteredCourses(subcategoryData.courses);
    }
  };

  // Check if template is enrolled
  const isTemplateEnrolled = (templateId) => {
    // Convert to string for comparison if needed
    return enrolledTemplates.some(id => id && templateId && id.toString() === templateId.toString());
  };

  // Check if course is enrolled
  const isCourseEnrolled = (courseId) => {
    // Convert to string for comparison if needed
    return enrolledCourses.some(id => id && courseId && id.toString() === courseId.toString());
  };

  // Check if course is favorited
  const isCourseFavorite = (courseId) => {
    return favoriteCourses.some(id => id && courseId && id.toString() === courseId.toString());
  };

  // Check if template is favorited
  const isTemplateFavorite = (templateId) => {
    return favoriteTemplates.some(id => id && templateId && id.toString() === templateId.toString());
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

  // Handle buy now button click for templates
  const handleTemplateBuyNow = (template, event) => {
    event.stopPropagation(); // Prevent card click event
    navigate(`/template/${template.id}`, { state: { template } });
  };

  // Handle buy now button click for courses
  const handleCourseBuyNow = (course, event) => {
    event.stopPropagation(); // Prevent card click event
    navigate(`/course/${course.id}`, { state: { course } });
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

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle scroll horizontally for subcategories
  const scrollSubcategories = (direction) => {
    const container = document.getElementById('subcategory-container');
    if (container) {
      const scrollAmount = 300;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <Navbar transparent={true} />

      {/* Course Banner Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "400px",
          overflow: "hidden",
          backgroundColor: "#E6EDFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Main large circle in the center */}
        <Box
          sx={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "#D6DFFF",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        />

        {/* Decorative circles */}
        <Circle size={80} color="#B5FFEB" top="20px" right="180px" />
        <Circle size={40} color="#B5FFEB" top="120px" left="380px" />
        <Circle size={60} color="#FFB5D5" top="170px" right="280px" />
        <Circle size={70} color="#B5CCFF" bottom="20px" left="60px" />

        {/* Content container */}
        <Container
          maxWidth="md"
          sx={{ position: "relative", zIndex: 2, textAlign: "center" }}
        >
          {/* Page title */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: "#333",
              fontWeight: 700,
              fontSize: { xs: "32px", md: "48px" },
              mb: 3,
            }}
          >
            Courses
          </Typography>

          {/* Breadcrumb navigation */}
          <Box
            sx={{
              display: "inline-flex",
              backgroundColor: "white",
              borderRadius: "30px",
              padding: "8px 20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Breadcrumbs separator="|" aria-label="breadcrumb">
              <Link
                color="inherit"
                href="/"
                sx={{
                  textDecoration: "none",
                  color: "#ACB5BD",
                  fontWeight: 500,
                }}
              >
                Home
              </Link>
              <Typography color="primary" fontWeight={500}>
                Courses
              </Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      {/* Category Section */}
      <Container maxWidth="lg">
        {/* Main category tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="course categories"
          >
            {categories.map((category, index) => (
              <CategoryTab key={index} label={category.name} />
            ))}
          </Tabs>
        </Box>

        {/* Subcategory scrollable row */}
        {categories[selectedCategory]?.name !== "All" && (
          <Box sx={{ position: 'relative', my: 3 }}>
            <IconButton
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                '&:hover': { bgcolor: 'white' }
              }}
              onClick={() => scrollSubcategories('left')}
            >
              <ChevronLeftIcon />
            </IconButton>

            <Box
              id="subcategory-container"
              sx={{
                display: 'flex',
                overflowX: 'auto',
                py: 1,
                px: 2,
                gap: 2,
                scrollbarWidth: 'none', // Firefox
                '&::-webkit-scrollbar': { display: 'none' }, // Chrome, Safari, Edge
              }}
            >
              {categories[selectedCategory]?.subcategories.map((subcategory, index) => (
                <SubcategoryCard
                  key={index}
                  active={selectedSubcategory === subcategory.name}
                  onClick={() => handleSubcategoryChange(subcategory.name)}
                >
                  <Typography variant="body1" fontWeight={selectedSubcategory === subcategory.name ? 700 : 400}>
                    {subcategory.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {subcategory.courses.length} courses
                  </Typography>
                </SubcategoryCard>
              ))}
            </Box>

            <IconButton
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                '&:hover': { bgcolor: 'white' }
              }}
              onClick={() => scrollSubcategories('right')}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}

        {/* Current category & subcategory title */}
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 700,
            mb: 3,
            mt: 4
          }}
        >
          {categories[selectedCategory]?.name === "All"
            ? "All Courses"
            : selectedSubcategory
              ? `${categories[selectedCategory]?.name}: ${selectedSubcategory}`
              : categories[selectedCategory]?.name}
        </Typography>

        {/* Courses in selected category */}
        {coursesLoading ? (
          <Typography variant="body1" sx={{ my: 3 }}>
            Loading courses...
          </Typography>
        ) : filteredCourses.length === 0 ? (
          <Typography variant="body1" sx={{ my: 3 }}>
            No courses available in this category.
          </Typography>
        ) : (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {filteredCourses.map((course, index) => (
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
                          sx={{backgroundColor:"#0133dc"}}
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
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </>
  );
};

export default Courses;
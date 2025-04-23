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
  Tab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DescriptionIcon from '@mui/icons-material/Description';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import baseurl from "../ApiService/ApiService";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
<Box sx={{ bgcolor: '#f7f9fa', py: 4 }}>
        <Container>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: "#333",
              fontWeight: 600,
              fontSize: { xs: "32px", md: "48px" },
              mb: 1,
            }}
          >
            Templates
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Expand your skills with our comprehensive template catalog
          </Typography>
        </Container>
      </Box>

      {/* Templates Section */}
      <Box sx={{ py: 5, mt: 0 }}>
        <Container maxWidth="lg">
          {templatesLoading && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              Loading templates...
            </Typography>
          )}

          {templatesError && (
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {templatesError}
            </Typography>
          )}

          {!templatesLoading && templates.length === 0 && !templatesError && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              No templates available at the moment.
            </Typography>
          )}

          {!templatesLoading && templates.length > 0 && (
            <Grid container spacing={3}>
              {templates.map((template, index) => {
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
                              <Box component="span" sx={{ color: '#10b981', mr: 0.5, fontWeight: 500 }}>
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
                              sx={{backgroundColor:"#0133dc"}}
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
        </Container>
      </Box>

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
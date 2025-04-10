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
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Rating,
  Drawer,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import StarIcon from "@mui/icons-material/Star";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import baseurl from "../ApiService/ApiService";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TuneIcon from '@mui/icons-material/Tune';

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

// Styled component for filter section
const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  height: '100%',
  position: 'sticky',
  top: theme.spacing(2),
}));

// Styled component for filter category
const FilterCategory = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Courses = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [priceRanges, setPriceRanges] = useState([
    { label: 'Free', min: 0, max: 0, checked: false },
    { label: 'Under ₹500', min: 1, max: 500, checked: false },
    { label: '₹500 - ₹1000', min: 500, max: 1000, checked: false },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000, checked: false },
    { label: 'Above ₹2000', min: 2000, max: 99999, checked: false },
  ]);
  
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showEnrolled, setShowEnrolled] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to calculate average rating
  const calculateAverageRating = (ratings) => {
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return 0;
    const total = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  // Get the current user ID from localStorage
  const getCurrentUserID = () => {
    try {
      const userData = localStorage.getItem("userInfo");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        return parsedUserData.id || parsedUserData.user_id || parsedUserData._id;
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

        // Fetch courses
        const courseResponse = await axios.get(`${baseurl}/api/course/all`);
        if (courseResponse.data && Array.isArray(courseResponse.data.courses)) {
          const courses = courseResponse.data.courses;
          setFeaturedCourses(courses);
          setFilteredCourses(courses);

          // Extract unique categories and subcategories
          const uniqueParentCategories = [...new Set(courses.map(course => course.parent_category))].filter(Boolean);
          
          // Create category structure
          const categoryData = uniqueParentCategories.map(category => {
            const coursesInCategory = courses.filter(course => course.parent_category === category);
            const subcategories = [...new Set(coursesInCategory.map(course => course.sub_category))].filter(Boolean);
            
            return {
              name: category,
              subcategories: subcategories
            };
          });
          
          setCategories([{ name: "All", subcategories: [] }, ...categoryData]);
        }
        setCoursesLoading(false);

        // Get current user ID
        const userId = getCurrentUserID();

        // Fetch enrollments if user is logged in
        if (userId) {
          try {
            const enrollmentResponse = await axios.get(`${baseurl}/api/enrollment/all`, {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
            });

            if (enrollmentResponse.data && enrollmentResponse.data.data) {
              // Filter enrollments for the current user
              const userEnrollments = enrollmentResponse.data.data.filter(
                enrollment => enrollment.user_id === userId ||
                  (enrollment.User && enrollment.User.id === userId)
              );

              // Extract course IDs from user enrollments
              const enrolledCourseIds = userEnrollments
                .filter(enrollment => enrollment.course_id ||
                  (enrollment.Course && enrollment.Course.id))
                .map(enrollment => enrollment.course_id ||
                  (enrollment.Course && enrollment.Course.id));

              setEnrolledCourses(enrolledCourseIds);
            }
          } catch (err) {
            console.error("Error fetching enrollments:", err);
          }
          
          // Fetch user favorites
          try {
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
            }
          } catch (err) {
            console.error("Error fetching favorites:", err);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setCoursesError("Failed to load courses. Please try again later.");
        setCoursesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    if (featuredCourses.length === 0) return;
    
    let filtered = [...featuredCourses];
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.parent_category === selectedCategory);
    }
    
    // Filter by subcategories
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter(course => selectedSubcategories.includes(course.sub_category));
    }
    
    // Filter by level
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(course => selectedLevels.includes(course.course_level));
    }
    
    // Filter by price range
    const selectedPriceRanges = priceRanges.filter(range => range.checked);
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(course => {
        const price = Number(course.course_price) || 0;
        return selectedPriceRanges.some(range => price >= range.min && price <= range.max);
      });
    }
    
    // Filter by rating
    if (ratingFilter > 0) {
      filtered = filtered.filter(course => {
        const avgRating = calculateAverageRating(course.Ratings);
        return avgRating >= ratingFilter;
      });
    }
    
    // Filter enrolled courses
    if (showEnrolled) {
      filtered = filtered.filter(course => isCourseEnrolled(course.id));
    }
    
    setFilteredCourses(filtered);
  }, [
    selectedCategory, 
    selectedSubcategories, 
    selectedLevels, 
    priceRanges, 
    ratingFilter, 
    showEnrolled
  ]);

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategories([]);
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategory)) {
        return prev.filter(item => item !== subcategory);
      } else {
        return [...prev, subcategory];
      }
    });
  };

  // Handle level selection
  const handleLevelChange = (level) => {
    setSelectedLevels(prev => {
      if (prev.includes(level)) {
        return prev.filter(item => item !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  // Handle price range selection
  const handlePriceRangeChange = (index) => {
    setPriceRanges(prev => {
      const updated = [...prev];
      updated[index].checked = !updated[index].checked;
      return updated;
    });
  };

  // Check if course is enrolled
  const isCourseEnrolled = (courseId) => {
    return enrolledCourses.some(id => id && courseId && id.toString() === courseId.toString());
  };

  // Check if course is favorited
  const isCourseFavorite = (courseId) => {
    return favoriteCourses.some(id => id && courseId && id.toString() === courseId.toString());
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

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategories([]);
    setSelectedLevels([]);
    setPriceRanges(priceRanges.map(range => ({ ...range, checked: false })));
    setRatingFilter(0);
    setShowEnrolled(false);
  };

  // Filter sidebar content
  const filterContent = (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={resetFilters}
          sx={{ mb: 2 }}
        >
          Reset Filters
        </Button>
      </Box>
      
      {/* Categories */}
      <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Categories</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <List dense disablePadding>
            {categories.map((category, index) => (
              <ListItem 
                key={index}
                button 
                selected={selectedCategory === category.name}
                onClick={() => handleCategoryChange(category.name)}
                sx={{
                  pl: 2,
                  backgroundColor: selectedCategory === category.name ? '#f0f7ff' : 'inherit',
                  '&:hover': {
                    backgroundColor: selectedCategory === category.name ? '#e3f2fd' : '#f5f5f5',
                  }
                }}
              >
                <ListItemText primary={category.name} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
      
      {/* Subcategories - only show if a category is selected */}
      {selectedCategory !== 'All' && (
        <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">Subcategories</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {categories
                .find(cat => cat.name === selectedCategory)?.subcategories
                .map((subcategory, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox 
                        checked={selectedSubcategories.includes(subcategory)}
                        onChange={() => handleSubcategoryChange(subcategory)}
                        size="small"
                      />
                    }
                    label={subcategory}
                  />
                ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* Level */}
      <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Level</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((level, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox 
                    checked={selectedLevels.includes(level)}
                    onChange={() => handleLevelChange(level)}
                    size="small"
                  />
                }
                label={level}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
     
      {/* Show only enrolled courses */}
      {userId && (
        <FormControlLabel
          control={
            <Checkbox 
              checked={showEnrolled}
              onChange={() => setShowEnrolled(!showEnrolled)}
            />
          }
          label="My Courses"
        />
      )}
    </>
  );

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
            Courses
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Expand your skills with our comprehensive course catalog
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ my: 4 }}>
        {/* Mobile filter toggle button */}
        {isMobile && (
          <Button
            startIcon={<TuneIcon />}
            variant="outlined"
            onClick={() => setMobileFilterOpen(true)}
            sx={{ mb: 2 }}
            fullWidth
          >
            Filter Courses
          </Button>
        )}

        {/* Main content layout */}
        <Grid container spacing={3}>
          {/* Left sidebar for desktop */}
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <FilterSection elevation={0}>
                {filterContent}
              </FilterSection>
            </Grid>
          )}

          {/* Mobile drawer for filters */}
          <Drawer
            anchor="left"
            open={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
          >
            <Box sx={{ width: 280, p: 2 }}>
              {filterContent}
            </Box>
          </Drawer>

          {/* Course grid */}
          <Grid item xs={12} md={9}>
            {/* Current selection information */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                {selectedCategory === 'All' ? 'All Courses' : selectedCategory}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
              </Typography>
            </Box>

            {/* Course cards */}
            {coursesLoading ? (
              <Typography variant="body1">Loading courses...</Typography>
            ) : coursesError ? (
              <Typography variant="body1" color="error">{coursesError}</Typography>
            ) : filteredCourses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6">No courses match your current filters</Typography>
                <Button variant="outlined" onClick={resetFilters} sx={{ mt: 2 }}>
                  Reset Filters
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredCourses.map((course, index) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id || index}>
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
          </Grid>
        </Grid>
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
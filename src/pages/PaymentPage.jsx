import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Radio, RadioGroup, FormControlLabel, Container, Grid, Avatar, Divider, Snackbar, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import paymentpageimg from '../assets/paymentpage-img.png';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Use the course data from location state or initialize as empty object
  const courseData = location.state?.course || {};
  
  const [paymentMethod, setPaymentMethod] = useState('free');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Get user data from localStorage
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        setUserData(JSON.parse(userInfo));
      } else {
        // No user data, redirect to login
        setSnackbar({
          open: true,
          message: "Please login to proceed with payment",
          severity: "warning",
        });
        
        setTimeout(() => {
          // Save course info to redirect back after login
          localStorage.setItem("pendingPayment", JSON.stringify({
            courseId: courseData.id,
            courseTitle: courseData.course_title
          }));
          navigate('/login', { state: { from: location.pathname, course: courseData } });
        }, 2000);
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  }, [navigate, location.pathname, courseData]);

  // Redirect if no course data
  useEffect(() => {
    if (!courseData || !courseData.id) {
      navigate('/');
    }
  }, [courseData, navigate]);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCouponChange = (event) => {
    setCouponCode(event.target.value);
  };

  // Get course price from the correct property
  const getCoursePrice = () => {
    // Try to access both price and course_price fields
    return courseData?.course_price || courseData?.price || 300;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a coupon code",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get the correct price
      const coursePrice = getCoursePrice();
      
      // You can replace this with an actual API call to validate coupons
      // For now, we'll implement client-side validation for the test coupons
      if (couponCode.toUpperCase() === 'FREE100') {
        setCouponApplied(true);
        setDiscountAmount(coursePrice); // Make it free
        setSnackbar({
          open: true,
          message: "Coupon applied successfully! Your course is now free.",
          severity: "success",
        });
      } else if (couponCode.toUpperCase() === 'DISCOUNT50') {
        setCouponApplied(true);
        setDiscountAmount(coursePrice * 0.5); // 50% discount
        setSnackbar({
          open: true,
          message: "Coupon applied! 50% discount.",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Invalid coupon code",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setSnackbar({
        open: true,
        message: "Error applying coupon. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the current user ID from localStorage
  const getCurrentUserID = () => {
    try {
      if (userData && userData.id) {
        return userData.id;
      }
      
      // Alternatively try to get from userInfo in localStorage
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUserData = JSON.parse(userInfo);
        return parsedUserData.id || parsedUserData.user_id || parsedUserData._id;
      }
      
      // Check for token and extract user ID if needed
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

  // Calculate expiry date based on validity_days
  const calculateExpiryDate = (validityDays) => {
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + (parseInt(validityDays) || 30));
    
    // Return date in YYYY-MM-DD format
    return expiryDate.toISOString().split('T')[0];
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      
      // Get user ID
      const userId = getCurrentUserID();
      if (!userId) {
        setSnackbar({
          open: true,
          message: "User not found. Please login again.",
          severity: "error",
        });
        setProcessingPayment(false);
        
        // Redirect to login
        setTimeout(() => {
          navigate('/login', { state: { from: location.pathname } });
        }, 2000);
        return;
      }
      
      // Get the correct price
      const originalPrice = getCoursePrice();
      const finalPrice = originalPrice - discountAmount;
      
      // Generate a test transaction ID
      const testTransactionId = `TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // 1. Create payment record
      const paymentData = {
        user_id: userId,
        course_id: courseData.id,
        payment_method: paymentMethod,
        amount: finalPrice,
        coupon_code: couponApplied ? couponCode : null,
        discount_amount: discountAmount,
        payment_status: "completed", // For free testing
        transaction_id: testTransactionId,
        payment_date: new Date().toISOString()
      };
      
      // Make API call to payment endpoint
      const paymentResponse = await axios.post(
        `${baseurl}/api/payment/add`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (paymentResponse.data) {
        // 2. Now enroll the user in the course using the payment ID
        const enrollmentData = {
          user_id: userId,
          course_id: courseData.id,
          enrolled_date: new Date().toISOString().split('T')[0],
          expiry_date: calculateExpiryDate(courseData.validity_days),
          status: "active",
          payment_id: paymentResponse.data.id || paymentResponse.data.payment_id
        };
        
        // Call enrollment API
        const enrollResponse = await axios.post(
          `${baseurl}/api/enrollment/add`,
          enrollmentData,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        // Show success message
        setSnackbar({
          open: true,
          message: "Payment successful! You are now enrolled in the course.",
          severity: "success",
        });
        
        // Store enrollment data in localStorage for future reference
        const enrollmentInfo = {
          ...enrollmentData,
          enrollment_id: enrollResponse.data.id || enrollResponse.data.enrollment_id,
          course_title: courseData.course_title,
          course_image: courseData.course_image,
        };
        
        // Get existing enrollments or initialize empty array
        const existingEnrollments = JSON.parse(localStorage.getItem("enrollments") || "[]");
        existingEnrollments.push(enrollmentInfo);
        localStorage.setItem("enrollments", JSON.stringify(existingEnrollments));
        
        // Redirect to course content after a short delay
        setTimeout(() => {
          navigate(`/course-content/${courseData.id}`, {
            state: {
              course: courseData,
              enrollment: enrollmentInfo
            }
          });
        }, 2000);
      } else {
        throw new Error("Payment failed. No response data received.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Payment processing failed. Please try again.",
        severity: "error",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBackToSubscription = () => {
    navigate(`/course-details/${courseData.id}`, { state: { course: courseData } });
  };

  // If loading or no course data
  if (!courseData || !courseData.id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading payment details...</Typography>
      </Box>
    );
  }

  // Calculate price using the correct field
  const price = getCoursePrice();
  const totalPayable = price - discountAmount;

  // Format description for display, limiting length
  const formatDescription = (text) => {
    if (!text) return "";
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  // Payment options
  const paymentOptions = [
    { id: 'free', name: 'Free Payment (For Testing)', description: 'No actual payment will be made', additionalInfo: '' },
    { id: 'gpay', name: 'G Pay', description: 'Google Pay UPI', additionalInfo: 'Enter your UPI ID' },
    { id: 'card', name: 'Credit / Debit / ATM Card', description: 'All major cards accepted', additionalInfo: '' },
    { id: 'netbanking', name: 'Net Banking', description: 'All major banks supported', additionalInfo: '' }
  ];

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #e6eeff 0%, #f0f4ff 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ 
            bgcolor: '#e5e5e5', 
            p: 2, 
            borderRadius: 1,
            width: 120,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="body1">Logo</Typography>
          </Box>
          {userData && (
            <Avatar 
              sx={{ width: 40, height: 40 }}
              src={userData.profile_pic ? `${baseurl}/${userData.profile_pic}` : "/api/placeholder/40/40"}
              alt={userData.name || "User"}
            />
          )}
        </Box>

        {/* Back to Subscription */}
        <Button 
          startIcon={<ArrowBackIcon sx={{ color: '#3366ff' }} />}
          sx={{ 
            color: '#3366ff', 
            textTransform: 'none', 
            fontWeight: 500,
            mb: 2
          }}
          onClick={handleBackToSubscription}
        >
          Back to Course Details
        </Button>

        <Grid container spacing={4}>
          {/* Left Side - Image */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                borderRadius: 1, 
                p: 1, 
                bgcolor: 'white',
                position: 'relative',
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              {courseData.course_image ? (
                <img 
                  src={courseData.course_image.startsWith('http') 
                    ? courseData.course_image 
                    : `${baseurl}/${courseData.course_image}`} 
                  alt={courseData.course_title} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = paymentpageimg;
                  }}
                />
              ) : (
                <img 
                  src={paymentpageimg} 
                  alt="Course visualization" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              )}
            </Box>
          </Grid>

          {/* Right Side - Details */}
          <Grid item xs={12} md={8}>
            <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 500 }}>
                {courseData.course_title || "Course Title"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: '#666' }}>
                {courseData.parent_category || "Category"} - {courseData.category || "Subcategory"}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {courseData.rating || "4.5"} ({courseData.total_reviews || "0"} reviews)
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                {formatDescription(courseData.course_description || "No description available")}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Payment Summary */}
              <Typography variant="h6" sx={{ mb: 2 }}>Payment Summary</Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Course Price:</Typography>
                <Typography variant="body1" fontWeight="500">₹{price.toFixed(2)}</Typography>
              </Box>
              
              {couponApplied && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" color="success.main">Coupon Discount:</Typography>
                  <Typography variant="body1" color="success.main" fontWeight="500">-₹{discountAmount.toFixed(2)}</Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total Payable:</Typography>
                <Typography variant="h6" fontWeight="bold">₹{totalPayable.toFixed(2)}</Typography>
              </Box>
              
              {/* Coupon Code Section */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, mb: 3, gap: 1 }}>
                <TextField
                  label="Coupon Code"
                  variant="outlined"
                  size="small"
                  value={couponCode}
                  onChange={handleCouponChange}
                  sx={{ flexGrow: 1 }}
                  disabled={couponApplied || loading}
                />
                <Button
                  variant="outlined"
                  onClick={applyCoupon}
                  disabled={couponApplied || loading}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {loading ? <CircularProgress size={24} /> : "Apply Coupon"}
                </Button>
              </Box>
              
              {couponApplied && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Coupon '{couponCode}' applied successfully!
                </Alert>
              )}
              
              {/* Payment Methods */}
              <Typography variant="h6" sx={{ mb: 2 }}>Payment Method</Typography>
              
              <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                <Grid container spacing={2}>
                  {paymentOptions.map((option) => (
                    <Grid item xs={12} key={option.id}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: paymentMethod === option.id ? '#3366ff' : '#e0e0e0',
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: paymentMethod === option.id ? '#f0f5ff' : 'transparent'
                        }}
                      >
                        <FormControlLabel 
                          value={option.id}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={500}>{option.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{option.description}</Typography>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
              
              {/* Additional fields based on payment method */}
              {paymentMethod === 'gpay' && (
                <TextField
                  label="UPI ID"
                  variant="outlined"
                  size="small"
                  placeholder="yourname@upi"
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
              
              {/* Proceed to Payment Button */}
              <Button
                variant="contained"
                fullWidth
                sx={{ 
                  mt: 3, 
                  py: 1.5, 
                  backgroundColor: '#3366ff',
                  '&:hover': {
                    backgroundColor: '#2952cc'
                  }
                }}
                onClick={handlePayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Pay ₹${totalPayable.toFixed(2)}`
                )}
              </Button>
              
              {/* Payment Security Notice */}
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#666' }}>
                All payments are secure and encrypted. By proceeding, you agree to our Terms of Service.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentPage;
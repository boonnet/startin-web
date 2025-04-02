import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Grid, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Paper
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import StarIcon from '@mui/icons-material/Star';
import TranslateIcon from '@mui/icons-material/Translate';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AnimatedButton from '../components/Button';

// Styled component for the circle (matching the style from Courses component)
const Circle = ({ size = 60, color = "#B5CCFF", top, left, right, bottom }) => {
  return (
    <Box
      sx={{
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
      }}
    />
  );
};

const SubscriptionDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription } = location.state || { 
    subscription: {
      id: 3,
      title: 'Platinum Subscription',
      category: 'Business',
      lessons: 20,
      duration: '10 Hrs',
      rating: 4.95,
      level: 'Advanced',
      price: 'INR 1499/-',
      image: null,
      description: 'Unlimited access to all courses',
      includedCourses: ['Master Pitch Deck', 'Financial Modeling Expert', 'Advanced Fundraising', 'Valuation Mastery', 'Term Sheets and Negotiation', 'Exit Strategies', 'Investor Relations', 'Cap Tables & Shareholding']
    } 
  };

  // Sample course content for preview
  const courseContent = [
    {
      id: 1,
      title: 'Introduction',
      duration: '10:00',
      isVideo: true,
    },
    {
      id: 2,
      title: 'Core Concepts',
      duration: '25:30',
      isVideo: true,
    },
    {
      id: 3,
      title: 'Practical Applications',
      duration: '35:15',
      isVideo: true,
    },
    {
      id: 4,
      title: 'Case Studies',
      duration: '40:20',
      isVideo: true,
    },
    {
      id: 5,
      title: 'Workshop & Exercises',
      duration: '50:45',
      isVideo: true,
    }
  ];

  // Course features list
  const courseFeatures = [
    { icon: <TranslateIcon color="primary" />, text: 'English Medium' },
    { icon: <HourglassTopIcon color="primary" />, text: 'Lifetime Access' },
    { icon: <MenuBookIcon color="primary" />, text: 'Interactive Exercises' },
    { icon: <SignalCellularAltIcon color="primary" />, text: `${subscription.level} Level` },
    { icon: <DesktopWindowsIcon color="primary" />, text: 'Cross-platform Access' },
    { icon: <WorkspacePremiumIcon color="primary" />, text: 'Certificate of Completion' },
  ];

  // Handle subscription purchase
  const handleSubscribe = () => {
    // Navigate to checkout or payment page
    navigate('/checkout', { state: { subscription: subscription } });
    // For now just show alert
    alert(`Subscribing to ${subscription.title} for ${subscription.price}`);
  };

  return (
    <>  
    <Navbar transparent={false} />    
      {/* Header Section with Background */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "300px",
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
            width: "400px",
            height: "400px",
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
            {subscription.title}
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
              <Link
                color="inherit"
                href="/courses"
                sx={{
                  textDecoration: "none",
                  color: "#ACB5BD",
                  fontWeight: 500,
                }}
              >
                Courses
              </Link>
              <Typography color="primary" fontWeight={500}>
                {subscription.title}
              </Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Left Column - Subscription Details */}
          <Grid item xs={12} md={8}>
            <Box mb={4}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                {subscription.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuBookIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: '#374151' }}>
                    {subscription.lessons} Lessons
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: '#374151' }}>
                    {subscription.duration}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: '#374151' }}>
                    {subscription.rating}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SignalCellularAltIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: '#374151' }}>
                    {subscription.level}
                  </Typography>
                </Box>
              </Box>

              <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Subscription Description
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151', mb: 3 }}>
                  {subscription.description || "This comprehensive subscription package offers you access to professional courses designed to help founders and entrepreneurs navigate the complex world of startup financing, valuation, and investor relations. Learn at your own pace with expert-led lessons that provide practical knowledge for your business journey."}
                </Typography>
                
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                  What You'll Get
                </Typography>
                <List disablePadding>
                  {subscription.includedCourses.map((course, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckIcon sx={{ color: '#2563eb' }} />
                      </ListItemIcon>
                      <ListItemText primary={course} />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                Sample Course Content Preview
              </Typography>
              
              <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden', mb: 4 }}>
                <List disablePadding>
                  {courseContent.map((item, index) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        borderBottom: index < courseContent.length - 1 ? '1px solid #e5e7eb' : 'none',
                        py: 2,
                        px: 3,
                        '&:hover': { backgroundColor: '#f9fafb' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PlayCircleOutlineIcon sx={{ color: '#2563eb' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.title} 
                        secondary={item.isVideo ? `Video • ${item.duration}` : 'Document'} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Purchase Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                position: 'sticky',
                top: 20,
                overflow: 'hidden',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  textAlign: 'center' 
                }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    {subscription.price}
                  </Typography>
                  <Typography variant="body2">
                    One-time payment
                  </Typography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <List disablePadding>
                    {courseFeatures.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {feature.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature.text} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <AnimatedButton 
                      buttonText="SUBSCRIBE NOW" 
                      onClick={handleSubscribe}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Related Courses Section */}
      <Box sx={{ backgroundColor: '#f8fafc', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 4 }}>
            Our Other Subscriptions
          </Typography>
          
          <Grid container spacing={3}>
            {[
              {
                id: subscription.id === 1 ? 2 : 1,
                title: subscription.id === 1 ? 'Gold Subscription' : 'Silver Subscription',
                price: subscription.id === 1 ? 'INR 800/-' : 'INR 300/-',
                level: subscription.id === 1 ? 'Intermediate' : 'Beginner',
                lessons: subscription.id === 1 ? 12 : 6,
                duration: subscription.id === 1 ? '5 Hrs' : '2 Hrs',
              },
              {
                id: subscription.id === 3 ? 2 : 3,
                title: subscription.id === 3 ? 'Gold Subscription' : 'Platinum Subscription',
                price: subscription.id === 3 ? 'INR 800/-' : 'INR 1499/-',
                level: subscription.id === 3 ? 'Intermediate' : 'Advanced',
                lessons: subscription.id === 3 ? 12 : 20,
                duration: subscription.id === 3 ? '5 Hrs' : '10 Hrs',
              }
            ].map((item) => (
              <Grid item xs={12} sm={6} md={6} key={item.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={() => navigate('/subscription-details', { 
                    state: { subscription: item } 
                  })}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Chip
                      label="Business"
                      sx={{
                        bgcolor: item.id === 1 ? '#9CA3AF' : item.id === 2 ? '#FBBF24' : '#3B82F6',
                        color: 'white',
                        fontWeight: 'medium',
                        mb: 2
                      }}
                    />
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 'bold',
                        mb: 2,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        color: '#2563EB'
                      }}
                    >
                      {item.price}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MenuBookIcon sx={{ color: '#10b981', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {item.lessons} Lessons
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ color: '#10b981', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {item.duration}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SignalCellularAltIcon sx={{ color: '#10b981', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {item.level}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default SubscriptionDetails;
import React, {useState} from "react";
import {
  Box,Grid, Typography, Container, Breadcrumbs, Link, Divider,useTheme,useMediaQuery, CardContent, Card, Accordion, AccordionSummary, AccordionDetails,} from "@mui/material";
import { styled } from "@mui/material/styles";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedButton from "../components/Button";
import { useNavigate } from "react-router-dom";
import ourstory from "../assets/who-we-are.png";
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import generalquestion from '../assets/who-we-r-general-q.png'

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

const WhoWeAreHeader = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const cardData = [
    {
      title: "Quality Education",
      description: "Morem ipsum dolor sit amet, consectetur adipiscing elit.",
      id: "quality",
    },
    {
      title: "Learn more Anywhere",
      description: "Morem ipsum dolor sit amet, consectetur adipiscing elit.",
      id: "learn",
    },
    {
      title: "Free Trial Courses",
      description: "Morem ipsum dolor sit amet, consectetur adipiscing elit.",
      id: "free",
    },
  ];

  const faqItems = [
    {
      id: 'panel1',
      question: 'Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra.'
    },
    {
      id: 'panel2',
      question: 'Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra.'
    },
    {
      id: 'panel3',
      question: 'Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra.'
    },
    {
      id: 'panel4',
      question: 'Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra.'
    }
  ];

  return (
    <>
      <Navbar transparent={true} />
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
            Who we are
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
                Who we are
              </Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      {/* Section 2 */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {cardData.map((card, index) => (
            <React.Fragment key={card.id}>
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: isMobile ? 2 : 0,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      fontSize: isMobile
                        ? "1.1rem"
                        : isTablet
                        ? "1.3rem"
                        : "1.5rem",
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      fontSize: isMobile ? "0.875rem" : "1rem",
                    }}
                  >
                    {card.description}
                  </Typography>
                </Box>
                <AnimatedButton
                  buttonText="EXPLORE NOW"
                  onClick={() => navigate("/")}
                />
              </Box>
              {!isMobile && index < cardData.length - 1 && (
                <Divider orientation="vertical" flexItem />
              )}
              {isMobile && index < cardData.length - 1 && (
                <Divider sx={{ width: "100%", my: 2 }} />
              )}
            </React.Fragment>
          ))}
        </Box>
      </Container>

      {/* Section 3 */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={ourstory}
              alt="Team collaborating"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Grid>

          {/* Text Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                fontWeight="bold"
              >
                Our Story
              </Typography>

              <Typography
                variant="body1"
                paragraph
                lineHeight="32px"
                sx={{ textAlign: "justify" }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                vulputate libero et velit interdum, ac aliquet odio mattis.
                Class aptent taciti sociosqu ad litora torquent per conubia
                nostra, per inceptos himenaeos. Curabitur tempus urna at turpis
                condimentum lobortis. Ut commodo efficitur neque. Ut diam quam,
                semper lacinia condimentum ac, vestibulum eu nisl.Lorem ipsum
                dolor sit amet, consectetur adipiscing elit. Nunc vulputate
                libero et velit interdum, ac aliquet odio mattis. Class aptent
                taciti sociosqu ad litora torquent per conubia nostra, per
                inceptos himenaeos. Curabitur tempus urna at turpis condimentum
                lobortis. Ut commodo efficitur neque. Ut diam quam, semper
                lacinia condimentum ac, vestibulum eu nisl.Lorem ipsum dolor sit
                amet, consectetur adipiscing elit. Nunc vulputate libero et
                velit interdum, ac aliquet odio mattis. Class aptent taciti
                sociosqu ad litora torquent per conubia nostra, per inceptos
                himenaeos. Curabitur tempus urna at turpis condimentum lobortis.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Section 3 */}
      <Box sx={{  
  background: 'linear-gradient(135deg, rgba(253, 244, 255, 0.8) 0%, rgba(244, 255, 254, 0.8) 100%)',
  padding: 4
}}>
  <Grid container spacing={3} justifyContent='center' alignItems="center">
    <Grid item xs={12} md={10}>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3 }}>
        {/* Our Mission Card */}
        <Card elevation={0} sx={{
          maxWidth: 500,
          borderRadius: 4,
          background: '#ffffff',
          border: '1px solid rgba(0, 255, 204, 0.3)',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.03)',
          overflow: 'visible',
          flex: '1 1 450px'
        }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
            <Box sx={{
              width: '100px',
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 255, 204, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}>
               <StarIcon sx={{ color: '#00FFCC', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                Our Mission
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Our Vision Card */}
        <Card elevation={0} sx={{
          maxWidth: 500,
          borderRadius: 4,
          background: '#ffffff',
          border: '1px solid rgba(0, 255, 204, 0.3)',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.03)',
          overflow: 'visible',
          flex: '1 1 450px'
        }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
            <Box sx={{
              width: '100px',
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 255, 204, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}>
               <VisibilityIcon sx={{ color: '#00FFCC', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
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
</Box>

{/* Section 4 */}
<Box sx={{ 
      py: 8, 
      px: { xs: 2, md: 6 },
      maxWidth: '1200px',
      mx: 'auto',
      bgcolor: '#ffffff'
    }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: '#0066FF', 
              fontWeight: 600, 
              fontSize: '14px',
              mb: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            FREQUENTLY ASKED QUESTIONS
            <Box component="span" sx={{ ml: 1, borderTop: '1px solid #0066FF', width: '100px', display: 'inline-block' }}></Box>
          </Typography>
          
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 4,
              fontSize: { xs: '32px', md: '40px' }
            }}
          >
            General Questions
          </Typography>
          
          <Box>
            {faqItems.map((item) => (
              <Accordion 
                key={item.id}
                expanded={expanded === item.id}
                onChange={handleChange(item.id)}
                sx={{ 
                  mb: 2,
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px !important',
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: '0 0 16px 0',
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    padding: '16px 24px',
                    '& .MuiAccordionSummary-content': {
                      margin: '12px 0',
                    }
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '0 24px 24px 24px' }}>
                  <Typography>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* This would be your illustration - using placeholder since we can't recreate the exact illustration */}
          <Box 
            component="img" 
            src={generalquestion} 
            alt="FAQ Illustration with people and question marks" 
            sx={{ 
              maxWidth: '100%', 
              height: 'auto' 
            }} 
          />
        </Grid>
      </Grid>
    </Box>
    <Footer />
    </>
  );
};

export default WhoWeAreHeader;

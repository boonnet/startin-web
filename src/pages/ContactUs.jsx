import React, { useState } from 'react'
import { Box, Grid, Typography, Container, Breadcrumbs, Link, TextField, Button, Accordion, AccordionSummary, AccordionDetails, Stack } from "@mui/material";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { styled } from "@mui/material/styles";
import RoomIcon from "@mui/icons-material/Room";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
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

const ContactUs = () => {
    const [expanded, setExpanded] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        emailId: '',
        subject: '',
        message: ''
    });
    
    const handleChange = (panel) => (e, isExpanded) => {
        // Check if this is for the accordion expansion
        if (panel && typeof panel === 'string') {
            setExpanded(isExpanded ? panel : false);
            return;
        }

        // Handle form input changes
        if (e && e.target) {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your form submission logic here
        console.log(formData);
    };
    
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
                        Contact Us
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
                                Contact Us
                            </Typography>
                        </Breadcrumbs>
                    </Box>
                </Container>
            </Box>

            {/* Section 2 */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 4,
                    marginTop: '4%'
                }}
            >
                <Grid container spacing={4} maxWidth={900} alignItems="center">
                    {/* Location */}
                    <Grid item xs={12} md={4} textAlign="center">
                        <RoomIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" fontWeight="bold" mt={1}>
                            Our Location
                        </Typography>
                        <Typography variant="body1">10, Vascodagama Street,</Typography>
                        <Typography variant="body1">Chennai - 600001</Typography>
                    </Grid>
                    {/* Divider */}
                    <Grid
                        item
                        xs={12}
                        md={4}
                        textAlign="center"
                        sx={{ borderLeft: { md: "1px solid #ccc" }, borderRight: { md: "1px solid #ccc" }, py: { xs: 3, md: 0 } }}
                    >
                        <PhoneIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" fontWeight="bold" mt={1}>
                            Contact Number
                        </Typography>
                        <Typography variant="body1">+91 98765 43210</Typography>
                        <Typography variant="body1">+91 96325 87410</Typography>
                    </Grid>
                    {/* Email */}
                    <Grid item xs={12} md={4} textAlign="center">
                        <EmailIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" fontWeight="bold" mt={1}>
                            Send Email
                        </Typography>
                        <Typography variant="body1">info@example.com</Typography>
                        <Typography variant="body1">admin@example.com</Typography>
                    </Grid>
                </Grid>
            </Box>

    {/* Section 3 */}
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        align="center" 
        fontWeight="500" 
        gutterBottom
        sx={{ mb: 4 }}
      >
        For Any Enquiries
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Your Full Name
              </Typography>
              <TextField
                fullWidth
                name="fullName"
                variant="outlined"
                value={formData.fullName}
                onChange={handleChange}
                InputProps={{ 
                  sx: { 
                    bgcolor: '#f8f9fa',
                    borderRadius: 1
                  } 
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Your Email ID
              </Typography>
              <TextField
                fullWidth
                name="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                InputProps={{ 
                  sx: { 
                    bgcolor: '#f8f9fa',
                    borderRadius: 1
                  } 
                }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Your Subject
            </Typography>
            <TextField
              fullWidth
              name="subject"
              variant="outlined"
              value={formData.subject}
              onChange={handleChange}
              InputProps={{ 
                sx: { 
                  bgcolor: '#f8f9fa',
                  borderRadius: 1
                } 
              }}
            />
          </Box>

          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Your Message
            </Typography>
            <TextField
              fullWidth
              name="message"
              variant="outlined"
              value={formData.message}
              onChange={handleChange}
              multiline
              rows={6}
              InputProps={{ 
                sx: { 
                  bgcolor: '#f8f9fa',
                  borderRadius: 1
                } 
              }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              type="submit"
              sx={{
                bgcolor: '#0133dc',
                color: 'white',
                px: 4,
                py: 1,
                borderRadius: 8,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#0b5ed7'
                }
              }}
            >
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Container>

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
    )
}

export default ContactUs
import React from 'react'
import {
  Box, Typography, Divider, Container, useTheme, useMediaQuery, Grid, Card, CardContent, Paper
} from '@mui/material';
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

const Homepage = () => {
  const navigate = useNavigate()
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

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
      right: '-100px',
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


  return (
    <>
      <Navbar transparent={true} /> 
      {/* Section 1 */}
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Left Side - Images */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', height: '100%' }}>
              {/* First panel */}
              <Box sx={{
                width: '33%',
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                mr: 1
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
                  <Box sx={{ position: 'relative' }}>
                    <Box component="img" src={leftpng} alt="Financial chart overlay"
                      sx={{
                        width: '100%',
                        height: '100%',
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
                width: '33%',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                mx: 1
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box component="img" src={centerpng} alt="Person with glasses overlay"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        opacity: 0.9,
                        borderRadius: 2,
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
                width: '33%',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                ml: 1
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
                  <Box sx={{ position: 'relative' }}>
                    <Box component="img" src={rightpng} alt="Financial graph overlay"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        opacity: 0.9,
                        borderRadius: 2,
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

          {/* Right Side - Content */}
          <Grid item xs={12} md={7}>
            <Box sx={{ pl: { md: 4 }, mt: 2 }}>
              {/* Headline */}
              <Typography variant="h2" component="h1" sx={{
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}>
                Learn New Skills To
              </Typography>
              <Typography variant="h2" component="div" sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}>
                Go Ahead For Your Career
              </Typography>

              {/* Subtitle */}
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
              </Typography>

              {/* Mission Card */}
              <Card elevation={0} sx={{
                mb: 3,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                position: 'relative',
                overflow: 'visible'
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                  <Box sx={{
                    width: 100,
                    height: 60,
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
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
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
                <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                  <Box sx={{
                    width: 100,
                    height: 60,
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
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
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
      <Footer />
    </>
  )
}

export default Homepage
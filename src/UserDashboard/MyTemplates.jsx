import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Container,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import baseurl from '../ApiService/ApiService';
import axios from 'axios';

const MyTemplates = () => {
  const [enrolledTemplates, setEnrolledTemplates] = useState([]);
  const navigate = useNavigate();

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
  
  useEffect(() => {
    const fetchEnrolledTemplates = async () => {
      const userId = getCurrentUserID();
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      try {
        const enrollmentResponse = await axios.get(`${baseurl}/api/enrollment/all`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        console.log("All enrollments response:", enrollmentResponse.data);

        // Process enrollments data
        if (enrollmentResponse.data && enrollmentResponse.data.data) {
          // Filter enrollments for the current user and only those with template_id
          const userTemplateEnrollments = enrollmentResponse.data.data.filter(
            enrollment => (enrollment.user_id === userId ||
              (enrollment.User && enrollment.User.id === userId)) &&
              enrollment.template_id !== null &&
              enrollment.Template !== null
          );

          setEnrolledTemplates(userTemplateEnrollments);
          console.log("Current user enrolled templates:", userTemplateEnrollments);
        }
      } catch (err) {
        console.error("Error fetching template enrollments:", err);
      }
    };

    fetchEnrolledTemplates();
  }, []);

  const handleViewTemplate = (templateId) => {
    navigate(`/template/${templateId}`);
  };

  // Placeholder image for templates without images
  const placeholderImage = "/api/placeholder/300/150";
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        My Templates
      </Typography>
      
      {enrolledTemplates.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You haven't enrolled in any templates yet.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/Templates')}
            sx={{ 
              bgcolor: '#0d6efd',
              textTransform: 'none',
              px: 3,
              borderRadius: 1
            }}
          >
            Browse Templates
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {enrolledTemplates.map((enrollment, index) => {
            const template = enrollment.Template;
            if (!template) {
              console.error("Template is undefined for enrollment:", enrollment);
              return null; // Skip rendering if template is undefined
            }

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
              <Grid item xs={12} sm={6} md={4} key={`${template.id}-${index}`}>
                <Card 
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={template.cover_image ? `${baseurl}/${template.cover_image.replace(/\\/g, '/')}` : placeholderImage}
                    alt={template.template_name || "Template"}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <CardContent sx={{ p: 2, flexGrow: 1 }}>
                    
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1.5,
                        fontSize: '0.95rem',
                        lineHeight: 1.2
                      }}
                    >
                      {template.template_name}
                    </Typography>
                    
                    <Grid container spacing={1} sx={{ mb: 0.5 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DescriptionIcon sx={{ color: '#10b981', fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: '#374151' }}>
                            <Box component="span" sx={{ color: '#10b981', mr: 0.5, fontWeight: 500 }}>
                              {filesArray.length || 0}
                            </Box> Files
                          </Typography>
                        </Box>
                      </Grid>

                    </Grid>
                    
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        if (template && template.id) {
                          handleViewTemplate(template.id);
                        } else {
                          console.warn('Template ID is undefined for template:', template);
                        }
                      }}
                      sx={{ 
                        bgcolor: '#0d6efd',
                        textTransform: 'none',
                        mt: 2,
                        borderRadius: 1
                      }}
                    >
                      View Template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MyTemplates;
import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedButton from "../components/Button";
import {
    Box,
    Container,
    Typography,
    Breadcrumbs,
    Snackbar,
    Alert,
    Grid,
    Paper,
    Chip,
    Skeleton,
    Button,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import baseurl from "../ApiService/ApiService";
import { useNavigate } from "react-router-dom";

const TemplateDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const templateData = location.state?.template;
    const navigate = useNavigate();

    const [template, setTemplate] = useState(templateData || null);
    const [loading, setLoading] = useState(!templateData);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    // Added states for purchasing
    const [purchasing, setPurchasing] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // Get the current user ID from localStorage
    const getCurrentUserID = () => {
        try {
            // Check if user data exists in localStorage
            const userData = localStorage.getItem("userInfo");
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                // Return user ID from the userData object
                // Adjust the property name based on how your user data is structured
                return parsedUserData.id || parsedUserData.user_id || parsedUserData._id;
            }

            // Alternatively, check for a JWT token and decode it to get user ID
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
        const fetchTemplateData = async () => {
            if (!templateData) {
                try {
                    setLoading(true);
                    const response = await axios.get(`${baseurl}/api/templates/${id}`);
                    setTemplate(response.data.template);
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching template details:", err);
                    setError("Failed to load template details. Please try again later.");
                    setLoading(false);
                }
            }
        };

        fetchTemplateData();
    }, [id, templateData]);

    useEffect(() => {
        // Check if user is already enrolled when component mounts
        const checkUserEnrollment = async () => {
            const userId = getCurrentUserID();
            if (userId && template) {
                try {
                    const response = await axios.get(
                        `${baseurl}/api/enrollment/check`,
                        {
                            params: {
                                user_id: userId,
                                template_id: template.id || id
                            },
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    setIsEnrolled(response.data.isEnrolled);
                } catch (err) {
                    console.error("Error checking enrollment status:", err);
                }
            }
        };

        checkUserEnrollment();
    }, [id, template]);

    // Updated handlePurchase function to use the enrollment endpoint
    const handlePurchase = async () => {
        try {
            setPurchasing(true);

            // Get the current user ID
            const userId = getCurrentUserID();

            if (!userId) {
                // No user ID found, user might not be logged in
                setSnackbar({
                    open: true,
                    message: "You need to be logged in to purchase this template. Redirecting to login...",
                    severity: "warning",
                });

                // Redirect to login page after a short delay
                setTimeout(() => {
                    // Save template info to redirect back after login
                    localStorage.setItem("pendingPurchase", JSON.stringify({
                        templateId: template.id || id,
                    }));
                    navigate("/login", { state: { from: `/template/${template.id || id}` } });
                }, 2000);

                setPurchasing(false);
                return;
            }

            // Calculate enrollment and expiry dates
            const enrollmentDate = new Date().toISOString().split('T')[0];

            const enrollmentData = {
                user_id: userId,
                template_id: template.id || id,
                course_id: null, // No course associated with this template enrollment
                enrollment_date: enrollmentDate,
                expiry_date: null,
                status: "active",
            };

            // Make API call to enrollment endpoint
            const response = await axios.post(
                `${baseurl}/api/enrollment/add`,
                enrollmentData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            // Handle successful enrollment
            setSnackbar({
                open: true,
                message: "Template acquired successfully!",
                severity: "success",
            });

            // Update enrollment status
            setIsEnrolled(true);

            //Redirect to template viewer page
            setTimeout(() => {
                navigate(`/Templates`)
            }, 2000);
        }
        catch (err) {
            console.error("Error in enrollment process:", err);
            setSnackbar({
                open: true,
                message: err.response?.data?.message || "Failed to process enrollment. Please try again.",
                severity: "error",
            });
        } finally {
            setPurchasing(false);
        }
    };

    // Handle template files download
    const handleDownloadFiles = async () => {
        try {
            setDownloading(true);
    
            // Get the current user ID
            const userId = getCurrentUserID();
    
            if (!userId) {
                // User not logged in
                setSnackbar({
                    open: true,
                    message: "You need to be logged in to download these files. Redirecting to login...",
                    severity: "warning",
                });
    
                setTimeout(() => {
                    localStorage.setItem("pendingDownload", JSON.stringify({
                        templateId: template.id || id,
                    }));
                    navigate("/login", { state: { from: `/template/${template.id || id}` } });
                }, 2000);
    
                setDownloading(false);
                return;
            }
    
            // Check if user is enrolled for this template
            const checkEnrollmentResponse = await axios.get(
                `${baseurl}/api/enrollment/check`,
                {
                    params: {
                        user_id: userId,
                        template_id: template.id || id
                    },
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
    
            // Update this condition to properly check the response structure
            if (!checkEnrollmentResponse.data.isEnrolled) {
                setSnackbar({
                    open: true,
                    message: "Please purchase this template before downloading files.",
                    severity: "warning",
                });
                setDownloading(false);
                return;
            }
    
            // User is enrolled, proceed with download
            const templateFiles = JSON.parse(template.files || "[]");
    
            if (!templateFiles.length) {
                setSnackbar({
                    open: true,
                    message: "No files are available for download.",
                    severity: "info",
                });
                setDownloading(false);
                return;
            }
    
            // For single file download
            if (templateFiles.length === 1) {
                const fileUrl = `${baseurl}/${templateFiles[0].path.replace(/\\/g, '/')}`;
                const fileName = templateFiles[0].originalname || "template-file";
    
                // Create a link and trigger download
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setSnackbar({
                    open: true,
                    message: "File is being downloaded!",
                    severity: "success",
                });
            }
            // For multiple files, request a zip file from the server
            else {
                try {
                    const response = await axios.get(
                        `${baseurl}/api/templates/${template.id || id}/download-all`,
                        {
                            responseType: 'blob',
                            params: {
                                user_id: userId  // Include user_id in the query parameters
                            },
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
    
                    // Check if the response is actually a blob and not an error
                    if (response.data instanceof Blob && response.data.type !== 'application/json') {
                        // Create a URL for the blob response
                        const url = window.URL.createObjectURL(response.data);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `${template.template_name || 'template'}-files.zip`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Clean up by revoking the URL
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                        }, 100);
                        
                        setSnackbar({
                            open: true,
                            message: "Files are being downloaded!",
                            severity: "success",
                        });
                    } else {
                        // May be JSON error response disguised as blob
                        const reader = new FileReader();
                        reader.onload = function() {
                            try {
                                const errorData = JSON.parse(reader.result);
                                throw new Error(errorData.message || "Failed to download files");
                            } catch (e) {
                                setSnackbar({
                                    open: true,
                                    message: e.message || "Failed to download files. Please try again.",
                                    severity: "error",
                                });
                            }
                        };
                        reader.readAsText(response.data);
                    }
                } catch (err) {
                    console.error("Error downloading template files:", err);
                    
                    // Special handling for blob error responses
                    if (err.response && err.response.data instanceof Blob) {
                        const reader = new FileReader();
                        reader.onload = function() {
                            try {
                                const errorData = JSON.parse(reader.result);
                                setSnackbar({
                                    open: true,
                                    message: errorData.message || "Failed to download files. Please try again.",
                                    severity: "error",
                                });
                            } catch (e) {
                                setSnackbar({
                                    open: true,
                                    message: "Failed to download files. Please try again.",
                                    severity: "error",
                                });
                            }
                        };
                        reader.readAsText(err.response.data);
                    } else {
                        setSnackbar({
                            open: true,
                            message: err.response?.data?.message || "Failed to download files. Please try again.",
                            severity: "error",
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Error in download process:", err);
            setSnackbar({
                open: true,
                message: "An unexpected error occurred. Please try again later.",
                severity: "error",
            });
        } finally {
            setDownloading(false);
        }
    };

    // Handle snackbar close
    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Number of documents helper
    const getDocumentCount = () => {
        if (!template || !template.files) return 0;
        try {
            return JSON.parse(template.files).length;
        } catch (err) {
            return 0;
        }
    };

    // Template features
    const features = [
        "Fully Customizable",
        "Professional Design",
        "Industry-Standard Format",
        "Easy to Edit",
        "Available for Download",
    ];

    if (loading) {
        return (
            <>
                <Navbar transparent={true} />
                <Container
                    maxWidth="lg"
                    sx={{
                        py: 8,
                        minHeight: "60vh",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}
                >
                    <Skeleton variant="text" width="30%" height={40} />
                    <Skeleton variant="rectangular" width="100%" height={300} />
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="text" width="80%" height={20} />
                </Container>
                <Footer />
            </>
        );
    }

    if (error || !template) {
        return (
            <>
                <Navbar transparent={true} />
                <Container
                    maxWidth="lg"
                    sx={{
                        py: 8,
                        minHeight: "60vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h5" color="error">
                        {error || "Template not found"}
                    </Typography>
                </Container>
                <Footer />
            </>
        );
    }

    // Get cover image URL
    const coverImageUrl = template.cover_image
        ? `${baseurl}/${template.cover_image.replace(/\\/g, '/')}`
        : "https://via.placeholder.com/800x450?text=No+Preview+Available";

    return (
        <>
            <Navbar transparent={true} />

            {/* Header with background */}
            <Box
                sx={{
                    bgcolor: "#f0f4ff",
                    pt: 6,
                    pb: 3,
                    borderBottom: "1px solid #e0e7ff"
                }}
            >
                <Container maxWidth="lg">
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        separator="/"
                        aria-label="breadcrumb"
                        sx={{ mb: 3, color: "#666" }}
                    >
                        <Link to="/" style={{ textDecoration: "none", color: "#666" }}>
                            Home
                        </Link>
                        <Link to="/courses" style={{ textDecoration: "none", color: "#666" }}>
                            Templates
                        </Link>
                        <Typography color="primary" fontWeight="medium">
                            {template.template_name || "Template Details"}
                        </Typography>
                    </Breadcrumbs>

                    <Typography
                        variant="h3"
                        component="h1"
                        fontWeight="bold"
                        sx={{ mb: 2 }}
                    >
                        {template.template_name || "Template Details"}
                    </Typography>

                    {template.category && (
                        <Chip
                            label={template.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                    )}
                </Container>
            </Box>

            {/* Main Content */}
            <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {/* Left Column - Template Preview */}
                        <Grid item xs={12} md={7}>
                            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            backgroundImage: `url(${coverImageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            height: 0,
                                            paddingTop: '56.25%', // 16:9 aspect ratio
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                    </Box>
                            
                            </Paper>

                            {/* Template Description */}
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    {template.description || "No description available."}
                                </Typography>

                                {/* Documents Info */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="body1">
                                        {getDocumentCount()} document{getDocumentCount() !== 1 ? 's' : ''} included
                                    </Typography>
                                </Box>

                                {/* Category */}
                                {template.category && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CategoryIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="body1">
                                            Category: {template.category}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Date Added */}
                                {template.created_at && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="body1">
                                            Added on {formatDate(template.created_at)}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        {/* Right Column - Purchase Section */}
                        <Grid item xs={12} md={5}>
                            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {template.template_name}
                                    </Typography>
                                        <Typography variant="h6" fontWeight="bold">
                                            ₹ {template.price || "0.00"}
                                        </Typography>
                                </Box>

                                {/* Actions */}
                                <Box>
                                    {isEnrolled ? (
                                       <Box  sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircleIcon />}
                                                sx={{ py: 1.5, borderRadius: 2 }}
                                            >
                                                Successfully Purchased
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<DownloadIcon />}
                                                fullWidth
                                                onClick={handleDownloadFiles}
                                                disabled={downloading}
                                                sx={{ py: 1.5, borderRadius: 2 }}
                                            >
                                                {downloading ? "Downloading..." : "Download Files"}
                                            </Button>
                                        </Box>
                                       
                                    ):(
                                        <AnimatedButton
                                            onClick={handlePurchase}
                                            disabled={purchasing}
                                            buttonText="BUY NOW"
                                        >
                                            {purchasing
                                                ? "Processing..."
                                                : template.is_premium
                                                    ? `Acquire Now - $${template.price || "0.00"}`
                                                    : "Acquire for Free"}
                                        </AnimatedButton>
                                    )}
                                </Box>
                            </Paper>

                            {/* Features */}
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Features
                                </Typography>
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {features.map((feature, index) => (
                                        <Box
                                            component="li"
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 1,
                                                listStyleType: 'none',
                                            }}
                                        >
                                            <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography variant="body1">{feature}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Footer />

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default TemplateDetails;
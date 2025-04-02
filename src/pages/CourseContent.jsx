import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Box, Container, Typography, Grid, Card, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Button, Paper, CircularProgress, Alert, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Snackbar, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import baseurl from "../ApiService/ApiService";
import { saveAs } from 'file-saver';

const CourseContent = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const courseData = location.state?.course;
  const enrollmentData = location.state?.enrollment;

  // State variables
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [overallCourseProgress, setOverallCourseProgress] = useState(0);

  // Quiz related states
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Certificate dialog state
  const [certificateDialog, setCertificateDialog] = useState(false);

  // Download history statehandleVideoEnded 
  const [downloadHistory, setDownloadHistory] = useState([]);

  // State for rating modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Process lessons to format them correctly
  const processLessons = (lessons) => {
    return lessons.map(lesson => {
      if (lesson.lession_video) {
        lesson.lession_video = lesson.lession_video.replace(/\\/g, '/');
      }

      if (lesson.Quiz && lesson.Quiz.Questions) {
        lesson.Quiz.Questions = lesson.Quiz.Questions.map(question => {
          question.options = [
            question.option_1,
            question.option_2,
            question.option_3,
            question.option_4
          ].filter(option => option);

          return question;
        });
      }

      return lesson;
    });
  };

  useEffect(() => {
    if (activeLesson) {
      setIsLessonCompleted(completedLessons.includes(activeLesson.id));
    }
  }, [activeLesson, completedLessons]);


  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        setLoading(true);

        if (courseData) {
          setCourse(courseData);

          const sortedLessons = courseData.Lessions?.sort((a, b) =>
            (a.lession_order || 0) - (b.lession_order || 0)
          ) || [];

          const processedLessons = processLessons(sortedLessons);
          setLessons(processedLessons);

          if (processedLessons.length > 0) {
            setActiveLesson(processedLessons[0]);
          }

          setLoading(false);
          await loadCompletedLessons(processedLessons);
        } else {
          const response = await axios.get(`${baseurl}/api/course/${id}`);
          setCourse(response.data.course);

          const sortedLessons = response.data.course.Lessions?.sort((a, b) =>
            (a.lession_order || 0) - (b.lession_order || 0)
          ) || [];

          const processedLessons = processLessons(sortedLessons);
          setLessons(processedLessons);

          if (processedLessons.length > 0) {
            setActiveLesson(processedLessons[0]);
          }

          setLoading(false);
          await loadCompletedLessons(processedLessons);
        }
      } catch (err) {
        console.error("Error fetching course content:", err);
        setError("Failed to load course content. Please try again later.");
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [id, courseData]);



  // Get current user ID from localStorage
  const getCurrentUserID = () => {
    try {
      const userString = localStorage.getItem("userInfo");
      if (userString) {
        const userInfo = JSON.parse(userString);
        return userInfo.user_id || userInfo.id;
      }
      return null;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

  // Calculate progress per lesson
  const calculateProgressPerLesson = (currentLessons) => {
    if (!currentLessons || currentLessons.length === 0) return 0;
    return 100 / currentLessons.length;
  };

  // Calculate overall course progress
  const calculateOverallProgress = (completedLessonIds, allLessons) => {
    if (!allLessons || allLessons.length === 0) return 0;
    const progressPerLesson = calculateProgressPerLesson(allLessons);
    const totalProgress = completedLessonIds.length * progressPerLesson;
    return Math.min(Math.round(totalProgress), 100);
  };

  // Load completed lessons from API
  const loadCompletedLessons = async (currentLessons) => {
    try {
      const userId = getCurrentUserID();
      if (!userId) return;

      const response = await axios.get(`${baseurl}/api/course_progress/all`);

      const userCourseProgress = response.data.data.filter(
        progress =>
          progress.user_id == userId &&
          progress.course_id == id &&
          progress.status === 'completed'
      );

      const completedLessonIds = userCourseProgress.map(progress => progress.lession_id);
      setCompletedLessons(completedLessonIds);

      const lessonsToUse = currentLessons || lessons;
      const calculatedProgress = calculateOverallProgress(completedLessonIds, lessonsToUse);
      setOverallCourseProgress(calculatedProgress);
    } catch (error) {
      console.error("Error loading course progress:", error);
    }
  };

  // Save completed lesson to API
  const saveCompletedLesson = async (lessonId) => {
    try {
      const userId = getCurrentUserID();
      if (!userId) return;

      if (!completedLessons.includes(lessonId)) {
        const progressPerLesson = calculateProgressPerLesson(lessons);
        const completedIndex = completedLessons.length;
        const newProgress = Math.min(Math.round((completedIndex + 1) * progressPerLesson), 100);

        const progressResponse = await axios.get(`${baseurl}/api/course_progress/all`);
        const existingProgress = progressResponse.data.data.find(
          progress =>
            progress.user_id == userId &&
            progress.course_id == id &&
            progress.lession_id == lessonId
        );

        let success = false;

        if (existingProgress) {
          if (existingProgress.status !== 'completed') {
            try {
              await axios.put(`${baseurl}/api/course_progress/update/${existingProgress.id}`, {
                status: 'completed',
                progress_percentage: newProgress
              });
              success = true;
            } catch (updateError) {
              if (updateError.response && updateError.response.status === 409) {
                success = true;
              }
            }
          } else {
            success = true;
          }
        } else {
          try {
            await axios.post(`${baseurl}/api/course_progress/create`, {
              user_id: parseInt(userId),
              course_id: parseInt(id),
              lession_id: parseInt(lessonId),
              status: 'completed',
              progress_percentage: newProgress
            });
            success = true;
          } catch (createError) {
            if (createError.response && createError.response.status === 409) {
              success = true;
            }
          }
        }

        if (success) {
          const updatedCompletedLessons = [...completedLessons, lessonId];
          setCompletedLessons(updatedCompletedLessons);
          setOverallCourseProgress(newProgress);

          if (updatedCompletedLessons.length === lessons.length) {
            setCertificateDialog(true);
          }
        }
      }
    } catch (error) {
      console.error("Error saving course progress:", error);
      setSnackbar({
        open: true,
        message: "Error saving progress. Please try again.",
        severity: "error",
      });
    }
  };

  // Initialize lesson progress
  const initializeLessonProgress = async (lessonId) => {
    try {
      const userId = getCurrentUserID();
      if (!userId) return;

      const progressResponse = await axios.get(`${baseurl}/api/course_progress/all`);
      const existingProgress = progressResponse.data.data.find(
        progress =>
          progress.user_id == userId &&
          progress.course_id == id &&
          progress.lession_id == lessonId
      );

      if (!existingProgress) {
        const currentProgress = completedLessons.length > 0
          ? calculateOverallProgress(completedLessons, lessons)
          : 0;

        await axios.post(`${baseurl}/api/course_progress/create`, {
          user_id: parseInt(userId),
          course_id: parseInt(id),
          lession_id: parseInt(lessonId),
          status: 'in_progress',
          progress_percentage: currentProgress
        });
      } else if (existingProgress.status === 'not_started') {
        await axios.put(`${baseurl}/api/course_progress/update/${existingProgress.id}`, {
          status: 'in_progress',
          last_accessed_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error initializing lesson progress:", error);
    }
  };

  // Handle lesson selection
  const handleLessonSelect = (lesson, index) => {
    setActiveLesson(lesson);
    setActiveLessonIndex(index);
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizResults([]);
    setQuizAnswers({});

    initializeLessonProgress(lesson.id);

    // Update isLessonCompleted based on completedLessons
    setIsLessonCompleted(completedLessons.includes(lesson.id));
  };

  // Handle quiz answer selection
  const handleQuizAnswerChange = (questionId, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer,
    });
  };

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const userString = localStorage.getItem("userInfo");
      if (userString) {
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error("Error getting user info:", error);
      return null;
    }
  };

  // Find correct answer from question options
  const findCorrectAnswer = (question) => {
    if (question.correct_answer) {
      return question.correct_answer;
    }

    if (question.correct_option_index !== undefined && question.options[question.correct_option_index]) {
      return question.options[question.correct_option_index];
    }

    if (question.correct_option !== undefined) {
      return question.options[question.correct_option - 1];
    }

    for (let i = 1; i <= 4; i++) {
      if (question[`is_option_${i}_correct`] === true) {
        return question[`option_${i}`];
      }
    }

    return null;
  };

  // Handle quiz submission
  const handleQuizSubmit = async () => {
    try {
      setSubmittingQuiz(true);

      const questions = activeLesson.Quiz.Questions;
      let correctCount = 0;
      const results = [];

      questions.forEach(question => {
        const userAnswer = quizAnswers[question.id];
        const correctAnswer = findCorrectAnswer(question);
        const isCorrect = userAnswer === correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        results.push({
          questionId: question.id,
          question: question.question,
          userAnswer,
          correctAnswer,
          isCorrect
        });
      });

      const rawScore = correctCount;
      const percentageScore = questions.length > 0
        ? parseFloat((correctCount / questions.length * 100).toFixed(1))
        : 0;

      const user = getUserInfo();
      const userId = user?.user_id || user?.id;

      const submissionData = {
        user_id: userId,
        quiz_id: activeLesson.Quiz.id,
        course_id: parseInt(id, 10),
        lesson_id: activeLesson.id,
        score: rawScore,
        total_questions: questions.length,
        answers: Object.keys(quizAnswers).map(questionId => {
          const question = questions.find(q => q.id.toString() === questionId.toString());
          const correctAnswer = question ? findCorrectAnswer(question) : null;
          return {
            question_id: parseInt(questionId, 10),
            answer: quizAnswers[questionId],
            is_correct: quizAnswers[questionId] === correctAnswer
          };
        }),
        submission_date: new Date().toISOString()
      };

      await axios.post(`${baseurl}/api/quiz_submission/create`, submissionData);

      setQuizScore(percentageScore);
      setQuizResults(results);
      setQuizSubmitted(true);

      const passingScore = 70;

      if (percentageScore >= passingScore) {
        await saveCompletedLesson(activeLesson.id);

        setSnackbar({
          open: true,
          message: `Quiz completed! You scored ${rawScore} out of ${questions.length} (${percentageScore}%)`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Quiz completed. You scored ${rawScore} out of ${questions.length} (${percentageScore}%). You need 70% to pass.`,
          severity: "warning",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error submitting quiz. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Handle video ended event
  const handleVideoEnded = async () => {
    await saveCompletedLesson(activeLesson.id);
    setIsLessonCompleted(true);
    setSnackbar({
      open: true,
      message: "Lesson completed!",
      severity: "success",
    });
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    if (activeLessonIndex < lessons.length - 1) {
      const nextIndex = activeLessonIndex + 1;
      handleLessonSelect(lessons[nextIndex], nextIndex);
      setIsLessonCompleted(false);
    }
  };

  // Navigate to previous lesson
  const handlePreviousLesson = () => {
    if (activeLessonIndex > 0) {
      const prevIndex = activeLessonIndex - 1;
      handleLessonSelect(lessons[prevIndex], prevIndex);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if user is enrolled
  const isUserEnrolled = async () => {
    try {
      const userId = getCurrentUserID();
      if (!userId) return false;

      if (enrollmentData) return true;

      const response = await axios.get(`${baseurl}/api/enrollment/all`);
      const enrollments = response.data.data || response.data;

      return enrollments.some(enrollment =>
        enrollment.user_id == userId && enrollment.course_id == id
      );
    } catch (error) {
      console.error("Error checking enrollment status:", error);
      return true;
    }
  };

  // Handle certificate dialog close
  const handleCertificateDialogClose = () => {
    setCertificateDialog(false);
  };

  // Function to open rating modal
  const handleOpenRatingModal = () => {
    setRatingModalOpen(true);
  };

  // Function to close rating modal
  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
  };

  // Updated handleSubmitReview function
  const handleSubmitReview = async () => {
    console.log('Submitted review:', { rating: ratingValue, review: reviewText });
  
    // Get user info from localStorage
    const user = getUserInfo();
    const userId = user?.user_id || user?.id;
  
    // Prepare data for API submission
    const reviewData = {
      course_id: id,
      user_id: userId,
      review: reviewText,
      rating: ratingValue,
    };
  
    try {
      // Make the API call to submit the review
      const response = await axios.post('http://localhost:8000/api/rating/add', reviewData);
  
      // Handle successful submission
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: "Review submitted successfully!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setSnackbar({
        open: true,
        message: "Failed to submit review. Please try again.",
        severity: "error",
      });
    } finally {
      setRatingModalOpen(false);
      // Reset form
      setRatingValue(0);
      setReviewText('');
      
    }
  };

  // Handle download certificate
  const handleDownloadCertificate = async () => {
    try {
      const response = await fetch(`${baseurl}/${course.certificate_template}`);
      const blob = await response.blob();
      saveAs(blob, 'certificate.png');
  
      // Update download history
      setDownloadHistory(prevHistory => [
        ...prevHistory,
        { name: 'certificate.png', date: new Date().toLocaleString() }
      ]);
  
      setSnackbar({
        open: true,
        message: "Certificate downloaded successfully!",
        severity: "success",
      });
      setCertificateDialog(false);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      setSnackbar({
        open: true,
        message: "Failed to download certificate. Please try again.",
        severity: "error",
      });
    }
  };

  // Check enrollment and redirect if necessary
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!loading) {
        try {
          const enrolled = await isUserEnrolled();

          if (!enrolled) {
            setSnackbar({
              open: true,
              message: "You are not enrolled in this course. Redirecting...",
              severity: "warning",
            });

            setTimeout(() => {
              navigate(`/course-details/${id}`);
            }, 2000);
          }
        } catch (error) {
          console.error("Error in enrollment check:", error);
        }
      }
    };

    checkEnrollment();
  }, [loading, id, navigate]);

  // Helper function to construct video src URL
  const getVideoSrc = (videoPath) => {
    if (!videoPath) return "";

    // Check if the path is an absolute URL
    if (videoPath.startsWith('http')) {
      return videoPath;
    }

    // Otherwise join with baseurl
    return `${baseurl}/${videoPath}`;
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <Navbar transparent={true} />
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh"
        }}>
          <CircularProgress color="primary" />
        </Box>
        <Footer />
      </>
    );
  }

  // Render error state
  if (error || !course) {
    return (
      <>
        <Navbar transparent={true} />
        <Container maxWidth="lg" sx={{ py: 6, minHeight: "60vh" }}>
          <Alert severity="error" sx={{ width: "100%" }}>
            {error || "Course not found"}
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  const progressPercentage = lessons.length > 0
    ? Math.round((completedLessons.length / lessons.length) * 100)
    : 0;

  return (
    <>
      <Navbar transparent={true} />

      <Box sx={{ bgcolor: "#f8fafc", minHeight: "calc(100vh - 64px)", py: 4 }}>
        <Container maxWidth="xl">
          {/* Course Title and Progress */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {course.course_title}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Course Progress
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {progressPercentage}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    bgcolor: "#e0e0e0",
                    borderRadius: 1,
                    mt: 0.5,
                    overflow: "hidden"
                  }}
                >
                  <Box
                    sx={{
                      width: `${progressPercentage}%`,
                      height: "100%",
                      bgcolor: "primary.main",
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>

              {/* Certificate button appears when all lessons are completed */}
              {completedLessons.length === lessons.length && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={() => setCertificateDialog(true)}
                >
                  Get Certificate
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Lesson navigation sidebar */}
            <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    p: 2,
                    borderBottom: "1px solid #e0e0e0",
                    fontWeight: "bold",
                    bgcolor: "#f5f5f5",
                  }}
                >
                  Course Lessons
                </Typography>

                <List disablePadding sx={{ maxHeight: "60vh", overflow: "auto" }}>
                  {lessons.map((lesson, index) => (
                    <React.Fragment key={lesson.id}>
                      {index > 0 && <Divider />}
                      <ListItemButton
                        selected={activeLesson?.id === lesson.id}
                        onClick={() => handleLessonSelect(lesson, index)}
                        disabled={activeLesson?.id !== lesson.id}
                      >
                        <ListItemIcon>
                          {lesson.content_type === "Video" ? (
                            <PlayArrowIcon color="primary" />
                          ) : lesson.content_type === "Quiz" ? (
                            <QuizIcon color="primary" />
                          ) : (
                            <DescriptionIcon color="primary" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={lesson.lession_title}
                          secondary={lesson.content_type}
                          primaryTypographyProps={{
                            fontWeight: activeLesson?.id === lesson.id ? "bold" : "normal",
                          }}
                        />
                        {completedLessons.includes(lesson.id) && (
                          <CheckCircleIcon color="success" fontSize="small" />
                        )}
                      </ListItemButton>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Lesson content area */}
            <Grid item xs={12} md={9}>
              <Paper elevation={1} sx={{ borderRadius: 2, p: 3 }}>
                {activeLesson ? (
                  <>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {activeLesson.lession_title}
                    </Typography>

                    {/* Lesson navigation buttons */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handlePreviousLesson}
                        disabled={activeLessonIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleNextLesson}
                        disabled={!isLessonCompleted || activeLessonIndex === lessons.length - 1}
                      >
                        Next
                      </Button>
                    </Box>

                    {/* Lesson content based on type */}
                    {activeLesson.content_type === "Video" && (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ position: "relative", pt: "56.25%", width: "100%" }}>
                          <video
                           style={{
                            position: "absolute",
                            top: "30%",
                            left: "50%",
                            width: "60%",
                            height: "60%",
                            borderRadius: 8,
                            transform: "translate(-50%, -50%)" // This will center the element
                          }}
                            controls
                            src={getVideoSrc(activeLesson.lession_video)}
                            onEnded={handleVideoEnded}
                            onContextMenu={(e) => e.preventDefault()}
                            controlsList="nodownload"
                          >
                            <track
                              kind="subtitles"
                              src="/subtitles.vtt" // Update this path to your actual subtitles file
                              srcLang="en"
                              label="English"
                              default
                            />
                          </video>
                        </Box>

                        {/* Video description */}
                        {/* <Typography variant="body1" sx={{ mt: 3 }}>
                            {activeLesson.description}
                          </Typography> */}

                        {/* Document download if available
                          {activeLesson.document_url && (
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              sx={{ mt: 2 }}
                              href={`${baseurl}/${activeLesson.document_url}`}
                              target="_blank"
                            >
                              Download Materials
                            </Button>
                          )} */}
                      </Box>
                    )}

                    {/* Quiz content */}
                    {activeLesson.content_type === "Quiz" && activeLesson.Quiz && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {activeLesson.Quiz.quiz_title}
                        </Typography>

                        {quizSubmitted ? (
                          // Show quiz results
                          <Box sx={{ mt: 2 }}>
                            <Alert
                              severity={quizScore >= 70 ? "success" : "warning"}
                              sx={{ mb: 3 }}
                            >
                              {quizScore >= 70
                                ? `Congratulations! You scored ${quizScore.toFixed(1)}%`
                                : `You scored ${quizScore.toFixed(1)}%. You need 70% to pass.`}
                            </Alert>

                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Results:
                            </Typography>

                            {quizResults.map((result, index) => (
                              <Box key={index} sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                  {index + 1}. {result.question}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color={result.isCorrect ? "success.main" : "error.main"}
                                  fontWeight="bold"
                                >
                                  Your Answer: {result.userAnswer || "No answer provided"}
                                </Typography>
                                {!result.isCorrect && (
                                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                    Correct Answer: {result.correctAnswer}
                                  </Typography>
                                )}
                              </Box>
                            ))}

                            <Button
                              variant="contained"
                              onClick={() => setQuizSubmitted(false)}
                              sx={{ mt: 2 }}
                            >
                              Try Again
                            </Button>
                          </Box>
                        ) : (
                          // Show quiz questions
                          <Box component="form" sx={{ mt: 2 }}>
                            {activeLesson.Quiz.Questions.map((question, index) => (
                              <Box key={question.id} sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                  {index + 1}. {question.question}
                                </Typography>

                                <FormControl component="fieldset" sx={{ width: "100%" }}>
                                  <RadioGroup
                                    value={quizAnswers[question.id] || ""}
                                    onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                                  >
                                    {question.options.map((option, optionIndex) => (
                                      <FormControlLabel
                                        key={optionIndex}
                                        value={option}
                                        control={<Radio />}
                                        label={option}
                                        sx={{
                                          p: 1,
                                          borderRadius: 1,
                                          "&:hover": { bgcolor: "#f5f5f5" },
                                          width: "100%"
                                        }}
                                      />
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              </Box>
                            ))}

                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleQuizSubmit}
                              sx={{ mt: 2 }}
                              disabled={Object.keys(quizAnswers).length !== activeLesson.Quiz.Questions.length || submittingQuiz}
                            >
                              {submittingQuiz ? <CircularProgress size={24} /> : "Submit Quiz"}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
                    No lesson selected. Please select a lesson from the sidebar.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Certificate dialog */}
      <Dialog open={certificateDialog} onClose={handleCertificateDialogClose}>
        <DialogTitle>Course Completed!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Congratulations! You have completed all lessons in this course.
            You can now download your certificate of completion.
          </DialogContentText>

          {course.certificate_template && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <img
                src={`${baseurl}/${course.certificate_template}`}
                alt="Certificate Preview"
                style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: 8 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
  <Button onClick={handleCertificateDialogClose}>Close</Button>
  <Button
    variant="contained"
    onClick={handleOpenRatingModal}
    startIcon={<DownloadIcon />}
  >
    Download Certificate
  </Button>
</DialogActions>
      </Dialog>

      {/* Notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Rating modal */}
      <Dialog
        open={ratingModalOpen}
        onClose={handleCloseRatingModal}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">Rating & Review</Typography>
          <IconButton onClick={handleCloseRatingModal} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>Rating</Typography>
            <Box sx={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <IconButton
                  key={value}
                  onClick={() => setRatingValue(value)}
                  sx={{ p: 0.5 }}
                >
                  {value <= ratingValue ?
                    <StarIcon sx={{ fontSize: 32, color: 'yellow' }} /> :
                    <StarBorderIcon sx={{ fontSize: 32, color: '#000' }} />
                  }
                </IconButton>
              ))}
            </Box>
          </Box>

          <Box
            component="textarea"
            placeholder="Write your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            sx={{
              width: '100%',
              minHeight: 120,
              p: 2,
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              fontFamily: 'inherit',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
  <Button
    onClick={handleCloseRatingModal}
    sx={{
      textTransform: 'none',
      color: 'black',
      bgcolor: '#f5f5f5',
      '&:hover': {
        bgcolor: '#e0e0e0',
      }
    }}
  >
    Close
  </Button>
  <Button
    onClick={async () => {
      await handleSubmitReview();
      handleDownloadCertificate();
    }}
    variant="contained"
    sx={{
      textTransform: 'none',
      bgcolor: '#0055ff',
      '&:hover': {
        bgcolor: '#0044cc',
      }
    }}
  >
    Post Review and Download Certificate
  </Button>
</DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default CourseContent;
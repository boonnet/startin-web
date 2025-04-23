import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReactPlayer from "react-player";
import {
  Box,
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Snackbar,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Forward10Icon from "@mui/icons-material/Forward10";
import Replay10Icon from "@mui/icons-material/Replay10";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import LockIcon from "@mui/icons-material/Lock";
import DescriptionIcon from "@mui/icons-material/Description";
import baseurl from "../ApiService/ApiService";
import { saveAs } from "file-saver";

const CourseContent = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const courseData = location.state?.course;
  const enrollmentData = location.state?.enrollment;
  const playerRef = useRef(null);
  const videoContainerRef = useRef(null);

  // State variables
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [overallCourseProgress, setOverallCourseProgress] = useState(0);
  const [availableLessons, setAvailableLessons] = useState([]);

  // Video player state
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const controlsTimerRef = useRef(null);

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

  // Download history state
  const [downloadHistory, setDownloadHistory] = useState([]);

  // State for rating modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Process lessons to format them correctly
  const processLessons = (lessons) => {
    return lessons.map((lesson) => {
      if (lesson.lession_video) {
        lesson.lession_video = lesson.lession_video.replace(/\\/g, "/");
      }

      if (lesson.document_url) {
        lesson.document_url = lesson.document_url.replace(/\\/g, "/");
      }

      if (lesson.Quiz && lesson.Quiz.Questions) {
        lesson.Quiz.Questions = lesson.Quiz.Questions.map((question) => {
          question.options = [
            question.option_1,
            question.option_2,
            question.option_3,
            question.option_4,
          ].filter((option) => option);

          return question;
        });
      }

      return lesson;
    });
  };

  // Determine which lessons are available based on completion status
  const updateAvailableLessons = (allLessons, completedLessonIds) => {
    if (!allLessons || allLessons.length === 0) return [];

    const available = [];
    let foundIncomplete = false;

    // First lesson is always available
    if (allLessons.length > 0) {
      available.push(allLessons[0].id);
    }

    // For remaining lessons, check if previous lesson is completed
    for (let i = 1; i < allLessons.length; i++) {
      const previousLessonId = allLessons[i - 1].id;

      if (completedLessonIds.includes(previousLessonId)) {
        available.push(allLessons[i].id);
      } else {
        foundIncomplete = true;
        break;
      }
    }

    setAvailableLessons(available);
  };

  useEffect(() => {
    if (activeLesson) {
      setIsLessonCompleted(completedLessons.includes(activeLesson.id));
      setVideoEnded(false);
      setVideoProgress(0);
    }
  }, [activeLesson, completedLessons]);

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        setLoading(true);

        if (courseData) {
          setCourse(courseData);

          const sortedLessons =
            courseData.Lessions?.sort(
              (a, b) => (a.lession_order || 0) - (b.lession_order || 0)
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

          const sortedLessons =
            response.data.course.Lessions?.sort(
              (a, b) => (a.lession_order || 0) - (b.lession_order || 0)
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
        (progress) =>
          progress.user_id == userId &&
          progress.course_id == id &&
          progress.status === "completed"
      );

      const completedLessonIds = userCourseProgress.map(
        (progress) => progress.lession_id
      );
      setCompletedLessons(completedLessonIds);

      const lessonsToUse = currentLessons || lessons;
      const calculatedProgress = calculateOverallProgress(
        completedLessonIds,
        lessonsToUse
      );
      setOverallCourseProgress(calculatedProgress);

      // Update available lessons based on completion status
      updateAvailableLessons(lessonsToUse, completedLessonIds);
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
        const newProgress = Math.min(
          Math.round((completedIndex + 1) * progressPerLesson),
          100
        );

        const progressResponse = await axios.get(
          `${baseurl}/api/course_progress/all`
        );
        const existingProgress = progressResponse.data.data.find(
          (progress) =>
            progress.user_id == userId &&
            progress.course_id == id &&
            progress.lession_id == lessonId
        );

        let success = false;

        if (existingProgress) {
          if (existingProgress.status !== "completed") {
            try {
              await axios.put(
                `${baseurl}/api/course_progress/update/${existingProgress.id}`,
                {
                  status: "completed",
                  progress_percentage: newProgress,
                }
              );
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
              status: "completed",
              progress_percentage: newProgress,
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
          updateAvailableLessons(lessons, updatedCompletedLessons);

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

      const progressResponse = await axios.get(
        `${baseurl}/api/course_progress/all`
      );
      const existingProgress = progressResponse.data.data.find(
        (progress) =>
          progress.user_id == userId &&
          progress.course_id == id &&
          progress.lession_id == lessonId
      );

      if (!existingProgress) {
        const currentProgress =
          completedLessons.length > 0
            ? calculateOverallProgress(completedLessons, lessons)
            : 0;

        await axios.post(`${baseurl}/api/course_progress/create`, {
          user_id: parseInt(userId),
          course_id: parseInt(id),
          lession_id: parseInt(lessonId),
          status: "in_progress",
          progress_percentage: currentProgress,
        });
      } else if (existingProgress.status === "not_started") {
        await axios.put(
          `${baseurl}/api/course_progress/update/${existingProgress.id}`,
          {
            status: "in_progress",
            last_accessed_at: new Date().toISOString(),
          }
        );
      }
    } catch (error) {
      console.error("Error initializing lesson progress:", error);
    }
  };

  // Check if a lesson is available to access
  const isLessonAvailable = (lessonId) => {
    return availableLessons.includes(lessonId);
  };

  // Handle document download
  const handleDownloadDocument = async (documentUrl, documentName) => {
    try {
      const response = await fetch(`${baseurl}/${documentUrl}`);
      const blob = await response.blob();

      // Extract filename from URL or use a default name
      const filename =
        documentName || documentUrl.split("/").pop() || "document.pdf";

      saveAs(blob, filename);

      // Update download history
      setDownloadHistory((prevHistory) => [
        ...prevHistory,
        { name: filename, date: new Date().toLocaleString() },
      ]);

      setSnackbar({
        open: true,
        message: "Document downloaded successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      setSnackbar({
        open: true,
        message: "Failed to download document. Please try again.",
        severity: "error",
      });
    }
  };

  // Handle lesson selection
  const handleLessonSelect = (lesson, index) => {
    // Check if lesson is available
    if (!isLessonAvailable(lesson.id)) {
      setSnackbar({
        open: true,
        message: "You need to complete previous lessons first",
        severity: "warning",
      });
      return;
    }

    setActiveLesson(lesson);
    setActiveLessonIndex(index);
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizResults([]);
    setQuizAnswers({});
    setVideoPlaying(false);
    setVideoProgress(0);
    setVideoDuration(0);
    setVideoEnded(false);

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

    if (
      question.correct_option_index !== undefined &&
      question.options[question.correct_option_index]
    ) {
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

      questions.forEach((question) => {
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
          isCorrect,
        });
      });

      const rawScore = correctCount;
      const percentageScore =
        questions.length > 0
          ? parseFloat(((correctCount / questions.length) * 100).toFixed(1))
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
        answers: Object.keys(quizAnswers).map((questionId) => {
          const question = questions.find(
            (q) => q.id.toString() === questionId.toString()
          );
          const correctAnswer = question ? findCorrectAnswer(question) : null;
          return {
            question_id: parseInt(questionId, 10),
            answer: quizAnswers[questionId],
            is_correct: quizAnswers[questionId] === correctAnswer,
          };
        }),
        submission_date: new Date().toISOString(),
      };

      await axios.post(`${baseurl}/api/quiz_submission/create`, submissionData);

      setQuizScore(percentageScore);
      setQuizResults(results);
      setQuizSubmitted(true);

      const passingScore = 70;

      if (percentageScore >= passingScore) {
        await saveCompletedLesson(activeLesson.id);
        setIsLessonCompleted(true);

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
    setVideoEnded(true);
    setVideoPlaying(false);
    await saveCompletedLesson(activeLesson.id);
    setIsLessonCompleted(true);
    setSnackbar({
      open: true,
      message: "Lesson completed!",
      severity: "success",
    });
  };

  // Handle video progress
  const handleVideoProgress = (progress) => {
    if (!seeking) {
      setVideoProgress(progress.played);

      // If video is near the end (98% completed), mark as ended
      if (progress.played > 0.98 && !videoEnded) {
        handleVideoEnded();
      }
    }
  };

  // Handle video duration change
  const handleVideoDuration = (duration) => {
    setVideoDuration(duration);
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    if (activeLessonIndex < lessons.length - 1) {
      const nextIndex = activeLessonIndex + 1;
      const nextLesson = lessons[nextIndex];

      // Check if next lesson is available
      if (isLessonAvailable(nextLesson.id)) {
        handleLessonSelect(nextLesson, nextIndex);
      } else {
        setSnackbar({
          open: true,
          message: "You need to complete the current lesson first",
          severity: "warning",
        });
      }
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

      return enrollments.some(
        (enrollment) =>
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
    console.log("Submitted review:", {
      rating: ratingValue,
      review: reviewText,
    });

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
      const response = await axios.post(
        "http://localhost:8000/api/rating/add",
        reviewData
      );

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
      setReviewText("");
    }
  };

  // Handle download certificate
  const handleDownloadCertificate = async () => {
    try {
      const response = await fetch(`${baseurl}/${course.certificate_template}`);
      const blob = await response.blob();
      saveAs(blob, "certificate.png");

      // Update download history
      setDownloadHistory((prevHistory) => [
        ...prevHistory,
        { name: "certificate.png", date: new Date().toLocaleString() },
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

  // Show controls on mouse movement
  const handleMouseMove = () => {
    setShowControls(true);
    resetControlsTimer();
  };

  // Timer to hide controls after inactivity
  const resetControlsTimer = () => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (videoPlaying) setShowControls(false);
    }, 3000);
  };

  // Handler for 10 second forward
  const handleForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(
        playerRef.current.getCurrentTime() + 10,
        videoDuration
      );
      playerRef.current.seekTo(newTime);
    }
  };

  // Handler for 10 second backward
  const handleRewind = () => {
    if (playerRef.current) {
      const newTime = Math.max(playerRef.current.getCurrentTime() - 10, 0);
      playerRef.current.seekTo(newTime);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (videoContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoContainerRef.current.requestFullscreen();
      }
    }
  };

  // Handle seek start
  const handleSeekStart = () => {
    setSeeking(true);
  };

  // Handle seek end
  const handleSeekEnd = (value) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(value));
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

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
    if (videoPath.startsWith("http")) {
      return videoPath;
    }

    // Otherwise join with baseurl
    return `${baseurl}/${videoPath}`;
  };

  // Format time for video progress display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <Navbar transparent={true} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
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

  const progressPercentage =
    lessons.length > 0
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
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
                    overflow: "hidden",
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenRatingModal}
                startIcon={<StarIcon />}
                sx={{ ml: 2 }}
              >
                Rate Course
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Lesson Sidebar */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 2,
                  height: "100%",
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Course Content
                </Typography>
                <List disablePadding>
                  {lessons.map((lesson, index) => (
                    <React.Fragment key={lesson.id}>
                      {index > 0 && <Divider />}
                      <ListItem disablePadding sx={{ display: "block" }}>
                        <ListItemButton
                          selected={activeLesson?.id === lesson.id}
                          onClick={() => handleLessonSelect(lesson, index)}
                          sx={{
                            borderRadius: 1,
                            opacity: isLessonAvailable(lesson.id) ? 1 : 0.5,
                            pointerEvents: isLessonAvailable(lesson.id)
                              ? "auto"
                              : "none",
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {completedLessons.includes(lesson.id) ? (
                              <CheckCircleIcon
                                color="success"
                                fontSize="small"
                              />
                            ) : isLessonAvailable(lesson.id) ? (
                              <PlayArrowIcon fontSize="small" />
                            ) : (
                              <LockIcon fontSize="small" color="disabled" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={lesson.lession_title}
                            primaryTypographyProps={{
                              variant: "body2",
                              fontWeight:
                                activeLesson?.id === lesson.id
                                  ? "bold"
                                  : "normal",
                            }}
                            secondary={
                              <Box component="span">
                                {lesson.Quiz ? "Quiz" : "Video"}
                              </Box>
                            }
                            secondaryTypographyProps={{ variant: "caption" }}
                          />
                        </ListItemButton>

                        {/* Document download button with same status logic */}
                        {lesson.document_url && (
                          <Box
                            sx={{
                              
                              p: 1,
                              py: 0.5,
                              display: "flex",
                              alignItems: "center",
                              backgroundColor: "rgba(0, 0, 0, 0.02)",
                              borderRadius: 1,
                              mt: 0.5,
                              cursor: isLessonAvailable(lesson.id)
                                ? "pointer"
                                : "not-allowed",
                              opacity: isLessonAvailable(lesson.id) ? 1 : 0.5,
                              transition: "all 0.2s",
                              "&:hover": {
                                backgroundColor: isLessonAvailable(lesson.id)
                                  ? "rgba(25, 118, 210, 0.08)"
                                  : "rgba(0, 0, 0, 0.02)",
                              },
                            }}
                            onClick={() => {
                              if (isLessonAvailable(lesson.id)) {
                                handleDownloadDocument(
                                  lesson.document_url,
                                  lesson.lession_title + " Document"
                                );
                              }
                            }}
                          >
                            <Box
                              sx={{
                                minWidth: 36,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              {completedLessons.includes(lesson.id) ? (
                                <CheckCircleIcon
                                  color="success"
                                  fontSize="small"
                                />
                              ) : isLessonAvailable(lesson.id) ? (
                                <DescriptionIcon
                                  fontSize="small"
                                  color="primary"
                                />
                              ) : (
                                <LockIcon fontSize="small" color="disabled" />
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              color={
                                isLessonAvailable(lesson.id)
                                  ? "text.secondary"
                                  : "text.disabled"
                              }
                            >
                              Lesson Materials
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button
                              size="small"
                              startIcon={<DownloadIcon fontSize="small" />}
                              variant="outlined"
                              color="primary"
                              disabled={!isLessonAvailable(lesson.id)}
                              sx={{ py: 0.5, minWidth: "auto" }}
                            >
                              Download
                            </Button>
                          </Box>
                        )}
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Main Content Area */}
            <Grid item xs={12} md={9}>
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                {activeLesson && (
                  <>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {activeLesson.lession_title}
                    </Typography>

                    {/* Video Player Section */}
                    {activeLesson.lession_video && (
                      <Box
                        ref={videoContainerRef}
                        sx={{
                          position: "relative",
                          mb: 3,
                          bgcolor: "#000",
                          borderRadius: 2,
                          overflow: "hidden",
                          boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                          "&:hover .controls": { opacity: 1 },
                        }}
                        onMouseMove={handleMouseMove}
                      >
                        <ReactPlayer
                          ref={playerRef}
                          url={getVideoSrc(activeLesson.lession_video)}
                          width="100%"
                          height="100%"
                          playing={videoPlaying}
                          muted={isMuted}
                          onProgress={handleVideoProgress}
                          onDuration={handleVideoDuration}
                          onEnded={handleVideoEnded}
                          controls={false}
                          style={{ backgroundColor: "#000" }}
                        />

                        {/* Custom Controls */}
                        <Box
                          className="controls"
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 2,
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4) 60%, transparent)",
                            display: "flex",
                            flexDirection: "column",
                            opacity: showControls ? 1 : 0,
                            transition: "opacity 0.3s ease",
                          }}
                        >
                          {/* Progress Bar */}
                          <Box
                            sx={{
                              width: "100%",
                              height: 6,
                              bgcolor: "rgba(255,255,255,0.3)",
                              borderRadius: 3,
                              mb: 2,
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const pos = (e.clientX - rect.left) / rect.width;
                              handleSeekEnd(pos);
                            }}
                          >
                            <Box
                              sx={{
                                width: `${videoProgress * 100}%`,
                                height: "100%",
                                background:
                                  "linear-gradient(to right, #3f51b5, #5c6bc0)",
                                borderRadius: 3,
                                position: "relative",
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                width: 14,
                                height: 14,
                                bgcolor: "#fff",
                                borderRadius: "50%",
                                top: "50%",
                                left: `calc(${videoProgress * 100}% - 7px)`,
                                transform: "translateY(-50%)",
                                boxShadow: "0 0 4px rgba(0,0,0,0.5)",
                                display: showControls ? "block" : "none",
                              }}
                            />
                          </Box>

                          {/* Controls Row */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <IconButton
                                onClick={() => setVideoPlaying(!videoPlaying)}
                                sx={{
                                  color: "#fff",
                                  bgcolor: "rgba(255,255,255,0.1)",
                                  backdropFilter: "blur(5px)",
                                  mr: 1,
                                  transition: "transform 0.2s ease",
                                  "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    transform: "scale(1.1)",
                                  },
                                }}
                                size="medium"
                              >
                                {videoPlaying ? (
                                  <PauseIcon />
                                ) : (
                                  <PlayArrowIcon />
                                )}
                              </IconButton>

                              <IconButton
                                onClick={handleRewind}
                                sx={{
                                  color: "#fff",
                                  opacity: 0.8,
                                  "&:hover": { opacity: 1 },
                                }}
                              >
                                <Replay10Icon />
                              </IconButton>

                              <IconButton
                                onClick={handleForward}
                                sx={{
                                  color: "#fff",
                                  opacity: 0.8,
                                  "&:hover": { opacity: 1 },
                                }}
                              >
                                <Forward10Icon />
                              </IconButton>

                              <IconButton
                                onClick={toggleMute}
                                sx={{
                                  color: "#fff",
                                  opacity: 0.8,
                                  "&:hover": { opacity: 1 },
                                }}
                              >
                                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                              </IconButton>

                              <Typography
                                variant="body2"
                                color="#fff"
                                sx={{
                                  ml: 1,
                                  fontWeight: 500,
                                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {formatTime(videoDuration * videoProgress)} /{" "}
                                {formatTime(videoDuration)}
                              </Typography>
                            </Box>

                            <Box>
                              <IconButton
                                onClick={handleFullscreen}
                                sx={{
                                  color: "#fff",
                                  opacity: 0.8,
                                  "&:hover": { opacity: 1 },
                                }}
                              >
                                <FullscreenIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>

                        {/* Video title overlay */}
                        {showControls && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              p: 2,
                              background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.4) 60%, transparent)",
                              opacity: showControls ? 1 : 0,
                              transition: "opacity 0.3s ease",
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#fff",
                                fontWeight: "bold",
                                textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                              }}
                            >
                              {activeLesson.lession_title}
                            </Typography>
                          </Box>
                        )}

                        {/* Play button overlay when paused */}
                        {!videoPlaying && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(0,0,0,0.3)",
                              cursor: "pointer",
                            }}
                            onClick={() => setVideoPlaying(true)}
                          >
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                bgcolor: "rgba(63, 81, 181, 0.85)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                                transition:
                                  "transform 0.2s ease, background-color 0.2s ease",
                                "&:hover": {
                                  transform: "scale(1.1)",
                                  bgcolor: "rgba(63, 81, 181, 1)",
                                },
                              }}
                            >
                              <PlayArrowIcon
                                sx={{ color: "#fff", fontSize: 40 }}
                              />
                            </Box>
                          </Box>
                        )}

                        {/* Loading indicator */}
                        {loading && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(0,0,0,0.5)",
                            }}
                          >
                            <CircularProgress color="primary" size={60} />
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Lesson Description */}
                    {activeLesson.lession_description && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Lesson Description
                        </Typography>
                        <Typography variant="body1">
                          {activeLesson.lession_description}
                        </Typography>
                      </Box>
                    )}

                    {/* Quiz Section */}
                    {activeLesson.Quiz &&
                      activeLesson.Quiz.Questions &&
                      activeLesson.Quiz.Questions.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              bgcolor: "#f0f7ff",
                              border: "1px solid #cce5ff",
                              borderRadius: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <QuizIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" fontWeight="bold">
                                Lesson Quiz
                              </Typography>
                            </Box>

                            {quizSubmitted ? (
                              <Box>
                                <Alert
                                  severity={
                                    quizScore >= 70 ? "success" : "warning"
                                  }
                                  sx={{ mb: 3 }}
                                >
                                  You scored {quizScore}%.{" "}
                                  {quizScore >= 70
                                    ? "Congratulations!"
                                    : "You need 70% to pass."}
                                </Alert>

                                <Typography variant="h6" gutterBottom>
                                  Quiz Results:
                                </Typography>
                                <List>
                                  {quizResults.map((result, index) => (
                                    <ListItem
                                      key={index}
                                      sx={{
                                        bgcolor: "#fff",
                                        mb: 2,
                                        borderRadius: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={`Q${index + 1}: ${
                                          result.question
                                        }`}
                                        secondary={
                                          <>
                                            <Typography
                                              variant="body2"
                                              component="span"
                                            >
                                              Your answer:{" "}
                                              <strong>
                                                {result.userAnswer ||
                                                  "Not answered"}
                                              </strong>
                                            </Typography>
                                            <br />
                                            <Typography
                                              variant="body2"
                                              component="span"
                                              color={
                                                result.isCorrect
                                                  ? "success.main"
                                                  : "error.main"
                                              }
                                            >
                                              Correct answer:{" "}
                                              <strong>
                                                {result.correctAnswer}
                                              </strong>
                                            </Typography>
                                          </>
                                        }
                                      />
                                      {result.isCorrect ? (
                                        <CheckCircleIcon color="success" />
                                      ) : (
                                        <CloseIcon color="error" />
                                      )}
                                    </ListItem>
                                  ))}
                                </List>

                                {quizScore < 70 && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setQuizSubmitted(false)}
                                    sx={{ mt: 2 }}
                                  >
                                    Try Again
                                  </Button>
                                )}
                              </Box>
                            ) : (
                              <Box>
                                <Typography variant="body1" paragraph>
                                  Complete this quiz to finish the lesson. You
                                  need 70% to pass.
                                </Typography>

                                {activeLesson.Quiz.Questions.map(
                                  (question, qIndex) => (
                                    <Paper
                                      key={question.id}
                                      sx={{
                                        p: 2,
                                        mb: 3,
                                        bgcolor: "#fff",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        gutterBottom
                                      >
                                        {qIndex + 1}. {question.question}
                                      </Typography>

                                      <FormControl
                                        component="fieldset"
                                        sx={{ width: "100%" }}
                                      >
                                        <RadioGroup
                                          value={quizAnswers[question.id] || ""}
                                          onChange={(e) =>
                                            handleQuizAnswerChange(
                                              question.id,
                                              e.target.value
                                            )
                                          }
                                        >
                                          {question.options.map(
                                            (option, optIndex) => (
                                              <FormControlLabel
                                                key={optIndex}
                                                value={option}
                                                control={<Radio />}
                                                label={option}
                                                sx={{
                                                  mb: 1,
                                                  p: 1,
                                                  width: "100%",
                                                  borderRadius: 1,
                                                  "&:hover": {
                                                    bgcolor: "#f5f5f5",
                                                  },
                                                }}
                                              />
                                            )
                                          )}
                                        </RadioGroup>
                                      </FormControl>
                                    </Paper>
                                  )
                                )}

                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleQuizSubmit}
                                  disabled={
                                    submittingQuiz ||
                                    Object.keys(quizAnswers).length !==
                                      activeLesson.Quiz.Questions.length
                                  }
                                  sx={{ mt: 2 }}
                                >
                                  {submittingQuiz ? (
                                    <>
                                      <CircularProgress
                                        size={24}
                                        sx={{ mr: 1, color: "#fff" }}
                                      />
                                      Submitting...
                                    </>
                                  ) : (
                                    "Submit Quiz"
                                  )}
                                </Button>
                              </Box>
                            )}
                          </Paper>
                        </Box>
                      )}
                  </>
                )}
              </Paper>

              {/* Navigation Buttons */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handlePreviousLesson}
                  disabled={activeLessonIndex === 0}
                >
                  Previous Lesson
                </Button>

                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNextLesson}
                  disabled={activeLessonIndex === lessons.length - 1}
                >
                  Next Lesson
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Certificate Dialog */}
      <Dialog
        open={certificateDialog}
        onClose={handleCertificateDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <StarIcon color="primary" sx={{ mr: 1 }} />
            Congratulations! Course Completed
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            You have successfully completed {course.course_title}. Download your
            certificate now!
          </DialogContentText>

          {course.certificate_template && (
            <Box
              component="img"
              src={`${baseurl}/${course.certificate_template}`}
              alt="Certificate"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "400px",
                objectFit: "contain",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCertificateDialogClose}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCertificate}
          >
            Download Certificate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog
        open={ratingModalOpen}
        onClose={handleCloseRatingModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rate This Course</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Share your experience with this course. Your feedback helps us
            improve!
          </DialogContentText>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                onClick={() => setRatingValue(star)}
                color={star <= ratingValue ? "primary" : "default"}
                sx={{ mx: 1 }}
              >
                {star <= ratingValue ? (
                  <StarIcon fontSize="large" />
                ) : (
                  <StarBorderIcon fontSize="large" />
                )}
              </IconButton>
            ))}
          </Box>

          <TextField
            label="Your Review"
            multiline
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Share your thoughts about the course..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRatingModal}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitReview}
            disabled={ratingValue === 0}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default CourseContent;

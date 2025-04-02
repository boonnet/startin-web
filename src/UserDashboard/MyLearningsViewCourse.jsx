import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Container,
  IconButton,
  Paper,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Modal,
  Dialog,
  DialogContent,
  DialogActions,
  Rating
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useNavigate, useParams } from 'react-router-dom';

// Mock course and quiz data
const coursesData = {
  1: {
    title: 'Investor Pitch Deck',
    lessons: [
      {
        id: 1,
        title: 'Introduction to the Concept',
        type: 'video',
        duration: '3:25',
        totalDuration: '20:00',
        progress: 15,
        active: true,
        quizId: 1
      },
      {
        id: 1,
        title: 'Introduction to the Concept',
        type: 'video',
        duration: '3:25',
        totalDuration: '20:00',
        progress: 15,
        active: true,
        quizId: 1
      },
      {
        id: 1,
        title: 'Introduction to the Concept',
        type: 'video',
        duration: '3:25',
        totalDuration: '20:00',
        progress: 15,
        active: false,
        quizId: 1
      }
    ]
  }
};

// Mock quiz data
const quizData = {
  1: {
    title: 'What is Pitch Deck?',
    questions: [
      {
        id: 1,
        text: 'What is Pitch Deck?',
        options: [
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        text: 'Which elements should be included in a pitch deck?',
        options: [
          'Problem statement, solution, market size, competition',
          'Only financial projections and team bios',
          'Marketing plan and detailed budget',
          'Technical specifications and product roadmap'
        ],
        correctAnswer: 0
      }
    ]
  }
};

const QuizPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  // Get course data based on the courseId
  const courseData = coursesData[courseId] || coursesData[1];
  
  // State for quiz mode
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  
  // State for Rating & Review modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  // Get current quiz data
  const currentQuiz = quizData[1]; // Using quiz 1 for now
  const totalQuestions = currentQuiz?.questions?.length || 0;
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  
  const handleBackClick = () => {
    if (quizActive) {
      setQuizActive(false);
    } else {
      navigate(-1);
    }
  };
  
  const handleStartQuiz = () => {
    setQuizActive(true);
    setCurrentQuestionIndex(0);
    setSelectedOptions({});
  };
  
  const handleSkipQuiz = () => {
    console.log('Skipping quiz');
  };
  
  const handleOptionSelect = (questionId, optionIndex) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: optionIndex
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz complete logic here
      console.log('Quiz completed', selectedOptions);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Rating & Review modal handlers
  const handleOpenRatingModal = () => {
    setRatingModalOpen(true);
  };
  
  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
  };
  
  const handleSubmitReview = () => {
    console.log('Submitted review:', { rating: ratingValue, review: reviewText });
    setRatingModalOpen(false);
    // Reset form
    setRatingValue(0);
    setReviewText('');
  };
  
  // Right column component - extracted to reuse in both views
  const RightColumn = () => (
    <Box sx={{ 
      flex: '0 0 40%', 
      border: '1px solid #e0e0e0', 
      borderRadius: 1,
      overflow: 'auto',
      maxHeight: 400
    }}>
      {courseData.lessons.map((lesson, index) => (
        <Box 
          key={index}
          sx={{ 
            borderBottom: index < courseData.lessons.length - 1 ? '1px solid #e0e0e0' : 'none',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {lesson.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <PlayCircleFilledIcon sx={{ color: '#0055ff', mr: 0.5, fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#0055ff', fontWeight: 'bold', mr: 0.5 }}>
                  Video
                </Typography>
              </Box>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Typography variant="body2" color="text.secondary">
                Duration: {lesson.duration} /{lesson.totalDuration}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={lesson.progress} 
              sx={{ 
                height: 5, 
                borderRadius: 2,
                bgcolor: '#e0e0e0',
                mb: 1.5,
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#0055ff'
                }
              }}
            />
            <Typography variant="body2" sx={{ mb: 1 }}>
              {lesson.progress}%
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ArticleIcon sx={{ color: '#0055ff', mr: 0.5, fontSize: 18 }} />
                <Typography variant="body2">
                  Lesson {lesson.id}
                </Typography>
              </Box>
              
              <Box sx={{ flexGrow: 1 }} />
              
              {lesson.active && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#0055ff' }}>
                  <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Active
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#0055ff', 
                cursor: 'pointer',
                mt: 1
              }}
            >
              Take Quiz 1: Test your knowledge in Introduction to the concept.
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
  
  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={handleBackClick}
            sx={{ color: 'black', mr: 0.5 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" sx={{ cursor: 'pointer' }} onClick={handleBackClick}>
            Back
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button 
            variant="contained" 
            onClick={handleOpenRatingModal}
            sx={{ 
              bgcolor: '#0055ff',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 1,
              px: 2,
              mt: 1.5,
            }}
          >
            Rating & Review
          </Button>
        </Box>
        
        <Typography 
          variant="h5" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Investor Pitch Deck
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Left Column */}
          <Box sx={{ flex: '0 0 60%' }}>
            {!quizActive ? (
              // Pre-Quiz view
              <>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Quiz 1
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  This quiz will test your knowledge on the topics covered in this section.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleStartQuiz}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 1,
                      bgcolor: '#0055ff',
                      px: 3,
                      py: 1
                    }}
                  >
                    Start Quiz
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleSkipQuiz}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 1,
                      bgcolor: '#ff44dd',
                      px: 3,
                      py: 1
                    }}
                  >
                    Skip Quiz
                  </Button>
                </Box>
              </>
            ) : (
              // Quiz view
              <>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Questions {currentQuestionIndex + 1} of {totalQuestions}
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 3 }}>
                  {currentQuestion?.text || 'Loading question...'}
                </Typography>
                
                <FormGroup>
                  {currentQuestion?.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={selectedOptions[currentQuestion.id] === index}
                          onChange={() => handleOptionSelect(currentQuestion.id, index)}
                          sx={{
                            '&.Mui-checked': {
                              color: '#0055ff',
                            },
                          }}
                        />
                      }
                      label={option}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </FormGroup>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 1,
                      bgcolor: '#e0e0e0',
                      color: 'black',
                      px: 3,
                      py: 1,
                      '&:disabled': {
                        bgcolor: '#f5f5f5',
                        color: '#bdbdbd',
                      }
                    }}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 1,
                      bgcolor: '#ff44dd',
                      px: 3,
                      py: 1
                    }}
                  >
                    {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
          
          {/* Right Column - now shows in both quiz and pre-quiz views */}
          <RightColumn />
        </Box>

        {/* Rating & Review Modal */}
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
              onClick={handleSubmitReview}
              variant="contained"
              sx={{ 
                textTransform: 'none',
                bgcolor: '#0055ff',
                '&:hover': {
                  bgcolor: '#0044cc',
                }
              }}
            >
              Post Review
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default QuizPage;
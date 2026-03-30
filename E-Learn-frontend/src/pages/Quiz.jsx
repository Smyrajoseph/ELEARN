import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProgress } from '../context/ProgressContext';
import quizService from '../services/quizService';
import videoService from '../services/videoService';
import Spinner from '../components/Spinner';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/Quiz.css';

const Quiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { markAsCompleted, fetchStats } = useProgress();

    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [video, setVideo] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [answers, setAnswers] = useState([]);
    const [issubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(null);

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                setLoading(true);
                
                // Try to get video first to find associated quiz
                try {
                    const videoData = await videoService.getVideoById(id);
                    setVideo(videoData);
                    
                    // If video has a quiz, use it
                    if (videoData.quiz) {
                        if (typeof videoData.quiz === 'string') {
                            const quizData = await quizService.getQuizById(videoData.quiz);
                            setQuiz(quizData);
                        } else {
                            setQuiz(videoData.quiz);
                        }
                    }
                } catch (error) {
                    // This is expected if 'id' is for a quiz directly, not a video
                }
                
                // If no quiz from video, try fetching quiz by ID
                if (!quiz) {
                    try {
                        const quizData = await quizService.getQuizById(id);
                        setQuiz(quizData);
                    } catch (error) {
                        console.error('Quiz not found:', error);
                    }
                }
            } catch (err) {
                console.error('Error fetching quiz:', err);
                toast.error('Failed to load quiz');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchQuizData();
        }
    }, [id, quiz]);

    const recordQuizResult = async (finalScore, finalAnswers = []) => {
        try {
            await quizService.submitQuizResponse(quiz._id || id, {
                score: finalScore,
                answers: finalAnswers.map((a, i) => ({
                    question_id: quiz.questions?.[i]?._id || id,
                    option_id: a.selected // Using text as option ID for robustness
                }))
            });
            // Refresh global stats
            if (fetchStats) await fetchStats();
        } catch (error) {
            console.error('Failed to record quiz result:', error);
        }
    };

    const handleSubmit = async () => {
        // Handle logic for both single question (legacy) and multi-question (new builder)
        const isMultiQuestion = quiz.questions && quiz.questions.length > 0;
        
        if (isMultiQuestion) {
            const currentQuestion = quiz.questions[currentQuestionIndex];
            const isAnswerCorrect = selectedOption === currentQuestion.correctAnswer;
            
            const newAnswers = [...answers, { 
                question: currentQuestion.question, 
                selected: selectedOption, 
                correct: isAnswerCorrect 
            }];
            setAnswers(newAnswers);

            if (currentQuestionIndex < quiz.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedOption('');
            } else {
                // Final submission
                setIsSubmitted(true);
                const correctCount = newAnswers.filter(a => a.correct).length;
                const finalScore = (correctCount / quiz.questions.length) * 100;
                setScore(finalScore);
                
                if (finalScore >= 50) { // Pass threshold
                    setIsCorrect(true);
                    await markAsCompleted(video?._id || id);
                    await recordQuizResult(finalScore, newAnswers);
                    toast.success(`Quiz Completed! Score: ${Math.round(finalScore)}%`);
                } else {
                    setIsCorrect(false);
                    toast.error(`Quiz Failed. Score: ${Math.round(finalScore)}%. Try again!`);
                }
            }
        } else {
            // Legacy / Single Question Mode
            if (!selectedOption) {
                toast.warning('Please select an answer');
                return;
            }

            setIsSubmitted(true);
            try {
                const finalScore = (selectedOption === quiz.correctAnswer || selectedOption === quiz.answer) ? 100 : 0;
                if (finalScore === 100) {
                    setIsCorrect(true);
                    setScore(100);
                    await markAsCompleted(video?._id || id);
                    await recordQuizResult(100, [{ question: quiz.question || quiz.title, selected: selectedOption, correct: true }]);
                    toast.success('Correct! Well done!');
                } else {
                    setIsCorrect(false);
                    setScore(0);
                    toast.error('Incorrect. Try again!');
                }
            } catch (error) {
                console.error('Error submitting quiz:', error);
            }
        }
    };

    const handleNext = () => {
        navigate('/student');
    };

    const handleRetry = () => {
        setIsSubmitted(false);
        setSelectedOption('');
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setIsCorrect(false);
        setScore(null);
    };

    const handleExternalQuizDone = async () => {
        await markAsCompleted(video?._id || id);
        toast.success('Course progress updated!');
        navigate('/student');
    };

    if (loading) {
        return <Spinner message="Loading quiz..." />;
    }

    if (!quiz) {
        return (
            <div className="quiz-container">
                <div className="quiz-card">
                    <h2>Quiz not found!</h2>
                    <button onClick={() => navigate('/student')} className="quiz-submit">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // RENDER: EXTERNAL LINK MODE
    if (quiz.quiz_link) {
        return (
            <div className="quiz-container">
                <div className="quiz-card" style={{ textAlign: 'center' }}>
                    <h2 className="quiz-title">External Quiz{video ? `: ${video.title}` : ''}</h2>
                    <p style={{ margin: '20px 0', fontSize: '1.1rem', color: '#4b5563' }}>
                        This quiz is hosted on an external platform. Please click the button below to take the assessment.
                    </p>
                    <a 
                        href={quiz.quiz_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="submit-btn"
                        style={{ display: 'inline-block', textDecoration: 'none', marginBottom: '20px' }}
                    >
                        Launch Quiz
                    </a>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}>
                        <p className="wf-small-text" style={{ marginBottom: '15px' }}>
                            Once you have finished the quiz, click below to unlock the next module.
                        </p>
                        <button className="wf-btn" onClick={handleExternalQuizDone}>
                            I Have Completed the Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: INTERNAL QUIZ (Builder or Single Question)
    const isMultiQuestion = quiz.questions && quiz.questions.length > 0;
    const currentQuestion = isMultiQuestion ? quiz.questions[currentQuestionIndex] : quiz;

    return (
        <div className="quiz-container">
            <div className="quiz-card">
                <h2 className="quiz-title">
                    {video ? `Quiz: ${video.title}` : 'Quiz'}
                    {isMultiQuestion && !issubmitted && (
                        <span style={{ float: 'right', fontSize: '0.9rem', color: '#6b7280' }}>
                           Question {currentQuestionIndex + 1} of {quiz.questions.length}
                        </span>
                    )}
                </h2>

                {!issubmitted ? (
                    <>
                        <p className="quiz-question">{currentQuestion.question || currentQuestion.title}</p>
                        <div className="quiz-options">
                            {(currentQuestion.options || []).map((option, index) => (
                                <div
                                    key={index}
                                    className={`quiz-option ${selectedOption === option ? 'selected' : ''}`}
                                    onClick={() => setSelectedOption(option)}
                                >
                                    <input
                                        type="radio"
                                        name="quiz"
                                        value={option}
                                        checked={selectedOption === option}
                                        onChange={() => setSelectedOption(option)}
                                        className="quiz-radio"
                                    />
                                    {option}
                                </div>
                            ))}
                        </div>
                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                        >
                            {isMultiQuestion && currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                        </button>
                    </>
                ) : (
                    <div className="result-container" style={{ textAlign: 'center' }}>
                        {isCorrect ? (
                            <div className="success-text">
                                <FaCheckCircle size={60} color="#006D5B" />
                                <h3>Congratulations!</h3>
                                <p>You passed with {Math.round(score)}% score.</p>
                                <p className="wf-small-text">The next module is now unlocked.</p>
                                <button className="submit-btn" onClick={handleNext}>Back to Dashboard</button>
                            </div>
                        ) : (
                            <div className="error-text">
                                <FaTimesCircle size={60} color="#ef4444" />
                                <h3>Not Quite...</h3>
                                <p>You scored {Math.round(score)}%. You need at least 50% to pass.</p>
                                <button className="retry-btn" onClick={handleRetry}>Try Again</button>
                                <button className="wf-btn-outline" style={{ marginTop: '10px', width: '100%' }} onClick={handleNext}>Return to Dashboard</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;

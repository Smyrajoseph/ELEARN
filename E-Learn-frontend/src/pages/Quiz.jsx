import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockVideos } from '../data/mockData';
import { useProgress } from '../context/ProgressContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/Quiz.css';

const Quiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { markAsCompleted } = useProgress();
    const videoId = parseInt(id);

    const video = (() => {
        const saved = localStorage.getItem('teacherVideos');
        const teacherVideos = saved ? JSON.parse(saved) : [];
        const combined = [...mockVideos, ...teacherVideos];
        return combined.find(v => v.id === videoId);
    })();
    const quiz = video?.quiz;

    const [selectedOption, setSelectedOption] = useState('');
    const [issubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    if (!video || !quiz) {
        return <div className="quiz-container"><h2>Quiz not found!</h2></div>;
    }

    const handleSubmit = () => {
        if (!selectedOption) return;

        setIsSubmitted(true);
        if (selectedOption === quiz.correctAnswer) {
            setIsCorrect(true);
            markAsCompleted(videoId);
        } else {
            setIsCorrect(false);
        }
    };

    const handleNext = () => {
        navigate('/student'); // Go back to dashboard to see unlocked content
    };

    const handleRetry = () => {
        setIsSubmitted(false);
        setSelectedOption('');
        setIsCorrect(false);
    };

    return (
        <div className="quiz-container">
            <div className="quiz-card">
                <h2 className="quiz-title">Quiz: {video.title}</h2>
                <p className="quiz-question">{quiz.question}</p>

                <div className="quiz-options">
                    {quiz.options.map((option, index) => (
                        <div
                            key={index}
                            className={`quiz-option ${selectedOption === option ? 'selected' : ''}`}
                            onClick={() => !issubmitted && setSelectedOption(option)}
                        >
                            <input
                                type="radio"
                                name="quiz"
                                value={option}
                                checked={selectedOption === option}
                                onChange={() => !issubmitted && setSelectedOption(option)}
                                disabled={issubmitted}
                                className="quiz-radio"
                            />
                            {option}
                        </div>
                    ))}
                </div>

                {!issubmitted ? (
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                    >
                        Submit Answer
                    </button>
                ) : (
                    <div className="result-container">
                        {isCorrect ? (
                            <div className="success-text">
                                <FaCheckCircle size={50} color="#006D5B" />
                                <h3>Correct!</h3>
                                <p>You have unlocked the next module.</p>
                                <button className="submit-btn" onClick={handleNext}>Back to Dashboard</button>
                            </div>
                        ) : (
                            <div className="error-text">
                                <FaTimesCircle size={50} color="#ef4444" />
                                <h3>Incorrect</h3>
                                <p>Please try again.</p>
                                <button className="retry-btn" onClick={handleRetry}>Retry</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;

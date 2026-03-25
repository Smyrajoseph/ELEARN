import React, { useState } from 'react';
import { toast } from 'react-toastify';

const UploadQuiz = ({ videos, onQuizSuccess }) => {
    const [selectedVideoId, setSelectedVideoId] = useState('');

    const handleQuizUpload = (e) => {
        e.preventDefault();

        if (!selectedVideoId) {
            toast.error('Please select a video for this quiz');
            return;
        }

        const quizData = {
            question: e.target.elements.quizQuestion.value,
            options: [
                e.target.elements.option1.value,
                e.target.elements.option2.value,
                e.target.elements.option3.value,
                e.target.elements.option4.value,
            ],
            correctAnswer: e.target.elements[`option${e.target.elements.correctOption.value}`].value
        };

        onQuizSuccess(parseInt(selectedVideoId), quizData);
        e.target.reset();
        setSelectedVideoId('');
    };

    return (
        <div id="quiz-upload-section" className="upload-card" style={{ marginBottom: '30px' }}>
            <h2 className="card-title">Create & Upload Quiz</h2>
            <form onSubmit={handleQuizUpload}>
                <label className="form-label">Select Video for Quiz</label>
                <select
                    className="form-input"
                    value={selectedVideoId}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                    required
                    style={{ appearance: 'auto' }}
                >
                    <option value="">-- Choose a video --</option>
                    {videos.map(video => (
                        <option key={video.id} value={video.id}>
                            {video.title} {video.quiz ? '(Has Quiz)' : ''}
                        </option>
                    ))}
                </select>

                <div className="section-title" style={{ fontSize: '1.2rem', color: '#006D5B', fontWeight: 'bold', marginTop: '20px' }}>Quiz Questions</div>

                <label className="form-label">Question</label>
                <input name="quizQuestion" type="text" placeholder="e.g. What is the complexity of binary search?" className="form-input" required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <div>
                        <label className="form-label">Option 1</label>
                        <input name="option1" type="text" className="form-input" required />
                    </div>
                    <div>
                        <label className="form-label">Option 2</label>
                        <input name="option2" type="text" className="form-input" required />
                    </div>
                    <div>
                        <label className="form-label">Option 3</label>
                        <input name="option3" type="text" className="form-input" required />
                    </div>
                    <div>
                        <label className="form-label">Option 4</label>
                        <input name="option4" type="text" className="form-input" required />
                    </div>
                </div>

                <label className="form-label">Correct Option</label>
                <select name="correctOption" className="form-input" required style={{ appearance: 'auto' }}>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                    <option value="4">Option 4</option>
                </select>

                <button type="submit" className="upload-btn" style={{ marginTop: '30px' }}>Upload Quiz</button>
            </form>
        </div>
    );
};

export default UploadQuiz;

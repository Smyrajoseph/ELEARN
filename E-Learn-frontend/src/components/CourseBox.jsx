import React from 'react';
import '../styles/CourseBox.css';

const CourseBox = ({ image, title, description, onClick, actionText }) => {
    return (
        <div className="course-box" onClick={onClick}>
            <div className="course-box-img-container">
                <img src={image} alt={title} className="course-box-img" />
                <div className="course-box-overlay">
                    <p className="course-box-description">{description}</p>
                </div>
            </div>
            <div className="course-box-info">
                <h3 className="course-box-title">{title}</h3>
                {actionText && <button className="course-box-action-btn">{actionText}</button>}
            </div>
        </div>
    );
};

export default CourseBox;

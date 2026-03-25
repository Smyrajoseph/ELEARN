import React from 'react';

const AddCourse = ({ onAddCourse }) => {
    return (
        <div id="add-course-section" className="upload-card" style={{ marginBottom: '30px', background: '#e0f2f1' }}>
            <h2 className="card-title" style={{ color: '#006D5B' }}>Add New Course</h2>
            <form onSubmit={onAddCourse}>
                <label className="form-label">Course Title</label>
                <input name="courseTitle" type="text" placeholder="e.g. Data Structures & Algorithms" className="form-input" required />

                <label className="form-label" style={{ marginTop: '10px' }}>Course Description</label>
                <textarea name="courseDescription" rows="3" placeholder="Briefly describe what this course covers..." className="form-input" required></textarea>

                <button type="submit" className="upload-btn" style={{ marginTop: '15px' }}>Create Course</button>
            </form>
        </div>
    );
};

export default AddCourse;

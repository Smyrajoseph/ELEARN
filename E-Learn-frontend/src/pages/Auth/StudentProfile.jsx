import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCamera, FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../../styles/Profile.css';

const StudentProfile = () => {
    const navigate = useNavigate();

    // Load initial data from localStorage or use defaults
    const [profileData, setProfileData] = useState(() => {
        const saved = localStorage.getItem('studentProfile');
        return saved ? JSON.parse(saved) : {
            name: "Smyra Johnson",
            email: "smyra.johnson@example.com",
            phone: "9876543210",
            photo: null,
            course: localStorage.getItem('selectedCourse') || "B.Sc Information Technology"
        };
    });

    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState({ ...profileData });

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setTempData({ ...tempData, phone: value });
    };

    const handleSave = () => {
        if (tempData.phone.length !== 10) {
            toast.error("Phone number must be exactly 10 digits.");
            return;
        }
        setProfileData(tempData);
        localStorage.setItem('studentProfile', JSON.stringify(tempData));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <button className="back-btn" onClick={() => navigate('/student')}>
                    <FaArrowLeft /> Back to Dashboard
                </button>
                <h1>Student Profile</h1>
            </div>

            <div className="profile-card">
                <div className="photo-section">
                    <div className="photo-container">
                        {tempData.photo ? (
                            <img src={tempData.photo} alt="Profile" className="profile-img" />
                        ) : (
                            <FaUserCircle className="profile-placeholder" />
                        )}
                        {isEditing && (
                            <label className="upload-label">
                                <FaCamera />
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                            </label>
                        )}
                    </div>
                </div>

                <div className="info-section">
                    <div className="info-group">
                        <label>Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={tempData.name}
                                onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                                className="edit-input"
                            />
                        ) : (
                            <p className="info-value">{profileData.name}</p>
                        )}
                    </div>

                    <div className="info-group">
                        <label>Email Address</label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={tempData.email}
                                onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                                className="edit-input"
                            />
                        ) : (
                            <p className="info-value">{profileData.email}</p>
                        )}
                    </div>

                    <div className="info-group">
                        <label>Phone Number</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={tempData.phone}
                                onChange={handlePhoneChange}
                                className="edit-input"
                                placeholder="10-digit mobile number"
                            />
                        ) : (
                            <p className="info-value">{profileData.phone}</p>
                        )}
                    </div>

                    <div className="info-group">
                        <label>Enrolled Course</label>
                        <p className="info-value course-tag">{profileData.course}</p>
                    </div>

                    <div className="profile-actions">
                        {isEditing ? (
                            <>
                                <button className="save-btn" onClick={handleSave}>
                                    <FaSave /> Save Changes
                                </button>
                                <button className="cancel-btn" onClick={() => {
                                    setIsEditing(false);
                                    setTempData({ ...profileData });
                                }}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;

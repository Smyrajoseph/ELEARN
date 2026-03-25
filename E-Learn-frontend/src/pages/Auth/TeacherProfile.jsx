import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCamera, FaArrowLeft, FaSave, FaIdCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../../styles/Profile.css';

const TeacherProfile = () => {
    const navigate = useNavigate();

    // Load initial data from localStorage or use defaults
    const [profileData, setProfileData] = useState(() => {
        const saved = localStorage.getItem('teacherProfile');
        return saved ? JSON.parse(saved) : {
            name: "Instructor Name",
            email: "teacher@example.com",
            id: "TCH-" + Math.floor(1000 + Math.random() * 9000),
            photo: null,
            expertise: "Professional Teaching"
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

    const handleSave = () => {
        setProfileData(tempData);
        localStorage.setItem('teacherProfile', JSON.stringify(tempData));
        setIsEditing(false);
        toast.success("Teacher profile updated successfully!");
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <button className="back-btn" onClick={() => navigate('/teacher')}>
                    <FaArrowLeft /> Back to Dashboard
                </button>
                <h1>Teacher Profile</h1>
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
                    <div className="teacher-id-badge" style={{ marginTop: '20px', background: '#006D5B', color: 'white', padding: '10px 20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaIdCard />
                        <span>ID: {profileData.id}</span>
                    </div>
                </div>

                <div className="info-section">
                    <div className="info-group">
                        <label>Teacher Name</label>
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
                        <label>Department / Expertise</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={tempData.expertise}
                                onChange={(e) => setTempData({ ...tempData, expertise: e.target.value })}
                                className="edit-input"
                            />
                        ) : (
                            <p className="info-value">{profileData.expertise}</p>
                        )}
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

export default TeacherProfile;

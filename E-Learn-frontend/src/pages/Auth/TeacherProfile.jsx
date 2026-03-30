import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCamera, FaArrowLeft, FaSave, FaIdCard, FaBook, FaBookOpen, FaClipboardCheck, FaUpload, FaGraduationCap, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import Spinner from '../../components/Spinner';
import '../../styles/TeacherDashboard.css';

const TeacherProfile = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        id: '',
        photo: null,
        expertise: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState({ ...profileData });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const profile = await profileService.getProfile();
                const data = {
                    name: profile.name || user?.name || '',
                    email: profile.email || user?.email || '',
                    id: profile.teacherId || user?._id || "TCH-" + Math.floor(1000 + Math.random() * 9000),
                    photo: profile.photo || user?.photo || null,
                    expertise: profile.expertise || 'Professional Teaching'
                };
                setProfileData(data);
                setTempData(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                const fallbackData = {
                    name: user?.name || '',
                    email: user?.email || '',
                    id: user?._id || "TCH-" + Math.floor(1000 + Math.random() * 9000),
                    photo: user?.photo || null,
                    expertise: 'Professional Teaching'
                };
                setProfileData(fallbackData);
                setTempData(fallbackData);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setUploading(true);
                const response = await profileService.uploadProfilePhoto(file);
                setTempData(prev => ({ ...prev, photo: response.photoUrl }));
                toast.success('Photo uploaded successfully!');
            } catch (error) {
                console.error('Error uploading photo:', error);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setTempData(prev => ({ ...prev, photo: reader.result }));
                };
                reader.readAsDataURL(file);
                toast.warning('Photo preview only (upload failed)');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await profileService.updateProfile({
                name: tempData.name,
                expertise: tempData.expertise,
                photo: tempData.photo
            });
            setProfileData(tempData);
            updateUser({ ...user, ...tempData });
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error('Error updating profile:', error);
            setProfileData(tempData);
            localStorage.setItem('teacherProfile', JSON.stringify(tempData));
            setIsEditing(false);
            toast.warning("Profile saved locally only");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // SHARED DASHBOARD UI - HEADER
    const renderHeader = () => (
        <nav className="wireframe-header">
            <div className="header-logo" onClick={() => navigate('/teacher')} style={{ cursor: 'pointer' }}>
                <FaGraduationCap size={30} />
                <span>E-Learn Platform</span>
            </div>
            <div className="header-links">
                <span onClick={() => navigate('/teacher')}>Back to Dashboard</span>
            </div>
            <div className="header-profile" style={{ cursor: 'default' }}>
                {tempData.photo ? (
                    <img src={tempData.photo} alt="Profile" className="sidebar-profile-img" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                ) : (
                    <FaUserCircle size={26} />
                )}
                <span>{tempData.name || 'Teacher'}</span>
                <FaSignOutAlt size={22} className="logout-icon" onClick={handleLogout} title="Logout" />
            </div>
        </nav>
    );

    // SHARED DASHBOARD UI - SIDEBAR
    const renderSidebar = () => (
        <aside className="wireframe-sidebar">
            <h3>Admin/Teacher Tools</h3>
            <ul>
                <li onClick={() => navigate('/teacher')}>
                    <FaBook /> My Courses
                </li>
                <li onClick={() => navigate('/teacher')}>
                    <FaBookOpen /> Subjects
                </li>
                <li onClick={() => navigate('/teacher')}>
                    <FaUserCircle /> Enrollment Requests
                </li>
                <li onClick={() => navigate('/teacher')}>
                    <FaClipboardCheck /> Quiz Creator
                </li>
                <li onClick={() => navigate('/teacher')}>
                    <FaUpload /> My Videos
                </li>
                <hr style={{ margin: '15px 0', borderColor: 'rgba(0,0,0,0.05)' }} />
                <li className="active">
                    <FaUserCircle /> My Profile
                </li>
            </ul>
        </aside>
    );

    if (loading && !profileData.name) {
        return <Spinner message="Loading profile..." />;
    }

    return (
        <div className="wireframe-layout">
            {renderHeader()}
            <div className="wireframe-body">
                {renderSidebar()}
                <main className="wireframe-main">
                    <div className="wireframe-section slide-in">
                        <div className="course-header-banner" style={{ marginBottom: '40px' }}>
                            <h2>Personal Information</h2>
                            <p className="wf-subtitle">Manage your account details and profile appearance.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
                            {/* Photo Section */}
                            <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                                <div style={{ 
                                    width: '180px', 
                                    height: '180px', 
                                    borderRadius: '50%', 
                                    border: '4px solid #e5e7eb',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    margin: '0 auto 20px auto',
                                    background: '#f9fafb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {tempData.photo ? (
                                        <img src={tempData.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FaUserCircle size={100} color="#d1d5db" />
                                    )}
                                    {isEditing && (
                                        <label style={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            left: 0, 
                                            right: 0, 
                                            background: 'rgba(16, 185, 129, 0.8)', 
                                            padding: '8px', 
                                            cursor: 'pointer',
                                            color: 'white'
                                        }}>
                                            <FaCamera />
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                                        </label>
                                    )}
                                </div>
                                <div className="teacher-id-badge" style={{ 
                                    marginTop: '20px', 
                                    background: '#10b981', 
                                    color: 'white', 
                                    padding: '8px 15px', 
                                    borderRadius: '25px', 
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '8px' 
                                }}>
                                    <FaIdCard />
                                    <span>ID: {profileData.id}</span>
                                </div>
                                {uploading && <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '10px' }}>Uploading...</p>}
                            </div>

                            {/* Info Form */}
                            <div style={{ flex: '1', minWidth: '300px' }}>
                                <form className="wf-upload-form" style={{ padding: '0', border: 'none', boxShadow: 'none' }} onSubmit={(e) => e.preventDefault()}>
                                    <div className="form-group">
                                        <label>Teacher Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={tempData.name}
                                                onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827' }}>{profileData.name}</p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={tempData.email}
                                                onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <p style={{ fontSize: '1.1rem', color: '#4b5563' }}>{profileData.email}</p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Profession / Expertise</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={tempData.expertise}
                                                onChange={(e) => setTempData({ ...tempData, expertise: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <p style={{ fontSize: '1.1rem', color: '#4b5563' }}>{profileData.expertise}</p>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                                        {isEditing ? (
                                            <>
                                                <button className="wf-btn" onClick={handleSave} style={{ minWidth: '150px' }}>
                                                    <FaSave style={{ marginRight: '8px' }} /> Save Changes
                                                </button>
                                                <button className="wf-btn-outline" onClick={() => {
                                                    setIsEditing(false);
                                                    setTempData({ ...profileData });
                                                }}>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button className="wf-btn" onClick={() => setIsEditing(true)} style={{ minWidth: '150px' }}>
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherProfile;


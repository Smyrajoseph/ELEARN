import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCamera, FaArrowLeft, FaSave, FaHome, FaSignOutAlt, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import Spinner from '../../components/Spinner';
import '../../styles/StudentDashboardModern.css';

const StudentProfile = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        photo: null,
        course: ''
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
                    phone: profile.phone || '',
                    photo: profile.photo || user?.photo || null,
                    course: profile.course || 'Not Enrolled'
                };
                setProfileData(data);
                setTempData(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                // Use user data from auth context as fallback
                const fallbackData = {
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: '',
                    photo: user?.photo || null,
                    course: user?.course || 'Not Enrolled'
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
                
                // Upload to backend
                const response = await profileService.uploadProfilePhoto(file);
                setTempData(prev => ({ ...prev, photo: response.photoUrl }));
                toast.success('Photo uploaded successfully!');
            } catch (error) {
                console.error('Error uploading photo:', error);
                
                // Fallback to local preview
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

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setTempData({ ...tempData, phone: value });
    };

    const handleSave = async () => {
        if (tempData.phone && tempData.phone.length !== 10) {
            toast.error("Phone number must be exactly 10 digits.");
            return;
        }

        try {
            setLoading(true);
            
            // Update profile via API
            const updatedProfile = await profileService.updateProfile({
                name: tempData.name,
                phone: tempData.phone,
                photo: tempData.photo
            });
            
            setProfileData(tempData);
            updateUser({ ...user, ...tempData });
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error('Error updating profile:', error);
            
            // Fallback to local storage
            setProfileData(tempData);
            localStorage.setItem('studentProfile', JSON.stringify(tempData));
            setIsEditing(false);
            toast.warning("Profile saved locally only");
        } finally {
            setLoading(false);
        }
    };

    // HEADER (Navbar)
    const renderHeader = () => (
        <nav className="wireframe-header">
            <div className="header-logo">
                <FaArrowLeft 
                    size={24} 
                    style={{ marginRight: '15px', cursor: 'pointer' }} 
                    onClick={() => navigate('/student')} 
                />
                <span>Student Profile</span>
            </div>
            <div className="header-links">
                <span onClick={() => navigate('/student')}>Dashboard</span>
                <span className="active">My Profile</span>
            </div>
            <div className="header-profile">
                {tempData.photo ? (
                    <img src={tempData.photo} alt="Profile" className="sidebar-profile-img" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                ) : (
                    <FaUserCircle size={26} />
                )}
                <span>{tempData.name || 'Student'}</span>
                <FaSignOutAlt size={22} className="logout-icon" onClick={handleLogout} title="Logout" />
            </div>
        </nav>
    );

    // SIDEBAR (Student Tools)
    const renderSidebar = () => (
        <aside className="wireframe-sidebar">
            <h3>Learning Tools</h3>
            <ul>
                <li onClick={() => navigate('/student')}>
                    <FaHome /> Dashboard
                </li>
                <li className="active">
                    <FaUserCircle /> My Profile
                </li>
                <hr style={{ margin: '15px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                <li onClick={handleLogout} style={{ color: '#f87171' }}>
                    <FaSignOutAlt /> Logout
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
                                            background: 'rgba(0,0,0,0.6)', 
                                            padding: '8px', 
                                            cursor: 'pointer',
                                            color: 'white'
                                        }}>
                                            <FaCamera />
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                                        </label>
                                    )}
                                </div>
                                {uploading && <p style={{ fontSize: '0.8rem', color: '#10b981' }}>Uploading...</p>}
                            </div>

                            {/* Info Form */}
                            <div style={{ flex: '1', minWidth: '300px' }}>
                                <div className="wf-upload-form" style={{ padding: '0', border: 'none', boxShadow: 'none' }}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={tempData.name}
                                                onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
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
                                            />
                                        ) : (
                                            <p style={{ fontSize: '1.1rem', color: '#4b5563' }}>{profileData.email}</p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={tempData.phone}
                                                onChange={handlePhoneChange}
                                                placeholder="10-digit mobile number"
                                            />
                                        ) : (
                                            <p style={{ fontSize: '1.1rem', color: '#4b5563' }}>{profileData.phone || 'Not provided'}</p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Enrolled Course</label>
                                        <span className="wf-tag" style={{ fontSize: '0.9rem', padding: '6px 15px' }}>
                                            {profileData.course}
                                        </span>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentProfile;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');

    // Dynamic course list
    const [courseList] = useState(() => {
        const defaults = [
            "B.Sc Information Technology",
            "Bachelors of Marketing",
            "Bachelors of Finance Management",
            "Bachelors for Commerce",
            "Bachelors of Banking & Insurance",
            "BAMMC"
        ];
        const saved = localStorage.getItem('customCourses');
        const custom = saved ? JSON.parse(saved) : [];
        const customTitles = custom.map(c => c.title);
        return [...defaults, ...customTitles];
    });

    const [course, setCourse] = useState(localStorage.getItem('selectedCourse') || (courseList[0] || ''));

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSignup = (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        // Create pending request for teacher approval if role is student
        if (role === 'student') {
            const profileData = {
                name: name,
                email: email,
                phone: "9876543210",
                photo: null,
                course: course,
                isApproved: false // Initial status
            };
            localStorage.setItem('studentProfile', JSON.stringify(profileData));
            localStorage.setItem('selectedCourse', course);

            // Add to Teacher's pending requests list
            const pendingRequests = JSON.parse(localStorage.getItem('pendingStudentRequests') || '[]');
            const newRequest = {
                id: Date.now(),
                name: name,
                email: email,
                course: course,
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Check if already exists by email to prevent duplicates in mock
            if (!pendingRequests.find(r => r.email === email)) {
                localStorage.setItem('pendingStudentRequests', JSON.stringify([...pendingRequests, newRequest]));
            }
        } else if (role === 'teacher') {
            const teacherProfile = {
                name: name,
                email: email,
                id: "TCH-" + Math.floor(1000 + Math.random() * 9000),
                photo: null,
                expertise: "General Teacher"
            };
            localStorage.setItem('teacherProfile', JSON.stringify(teacherProfile));
        }

        // Simulate signup logic
        toast.success(role === 'student' ? "Signup successful! Waiting for teacher approval." : `Account created for ${role}! Please login.`);
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="card auth-box">
                <h1 className="mb-20 auth-title">Create Account</h1>

                <form onSubmit={handleSignup}>
                    {/* Role Selection */}
                    <div className="form-group">
                        <label className="auth-label">I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="auth-input"
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    {/* Course Selection (Only for Students) */}
                    {role === 'student' && (
                        <div className="form-group animate-fade-in">
                            <label className="auth-label">Select Your Course</label>
                            <select
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="auth-input animated-focus"
                                required
                            >
                                {courseList.map((c, index) => (
                                    <option key={index} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Name Input */}
                    <div className="form-group">
                        <label className="auth-label">Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="form-group">
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="form-group-last">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    {/* Signup Button */}
                    <button type="submit" className="btn btn-primary auth-button">
                        Sign Up
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="auth-text">Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;

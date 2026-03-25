import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBookOpen, FaGraduationCap, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import '../App.css';
import '../styles/Home.css';
import CourseBox from '../components/CourseBox';
import '../styles/CourseBox.css';

// Import images
import itImg from '../assets/courses/it.png';
import marketingImg from '../assets/courses/marketing.png';
import financeImg from '../assets/courses/finance.png';
import commerceImg from '../assets/courses/commerce.png';
import bankingImg from '../assets/courses/banking.png';
import bammcImg from '../assets/courses/bammc.png';

const Home = () => {
    const navigate = useNavigate();
    const [date] = useState(new Date());
    const [visits, setVisits] = useState([]);

    // courses that i  have shown in home page 
    const [courses] = useState(() => {
        const defaults = [
            { id: 1, title: "B.Sc Information Technology", description: "Learn software development, networking, and database management.", image: itImg },
            { id: 2, title: "Bachelors of Marketing", description: "Master strategies for brand management and market analysis.", image: marketingImg },
            { id: 3, title: "Bachelors of Finance Management", description: "Understand financial planning, investment strategies, and corporate finance.", image: financeImg },
            { id: 4, title: "Bachelors for Commerce", description: "Comprehensive study of business, accounting, and economics.", image: commerceImg },
            { id: 5, title: "Bachelors of Banking & Insurance", description: "Study financial systems, risk management, and insurance policies.", image: bankingImg },
            { id: 6, title: "Bachelors of Multimedia and Mass Communication", description: "Bachelor of Arts in Multimedia and Mass Communication - study media, journalism, and creative production.", image: bammcImg }
        ];
        const saved = localStorage.getItem('customCourses');
        const custom = saved ? JSON.parse(saved) : [];
        return [...defaults, ...custom];
    });

    useEffect(() => {
        const savedVisits = JSON.parse(localStorage.getItem('websiteVisits') || '[]');
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        if (!savedVisits.includes(today)) {
            const updatedVisits = [...savedVisits, today];
            localStorage.setItem('websiteVisits', JSON.stringify(updatedVisits));
            setVisits(updatedVisits);
        } else {
            setVisits(savedVisits);
        }
    }, []);

    // Simple Calendar Helpers
    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const month = date.getMonth();
        const year = date.getFullYear();
        const days = daysInMonth(month, year);
        const firstDay = firstDayOfMonth(month, year);

        const calendarDays = [];

        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="calendar-day-empty"></div>);
        }

        for (let i = 1; i <= days; i++) {
            const isToday = i === new Date().getDate() && month === new Date().getMonth();
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isVisited = visits.includes(dateStr);

            calendarDays.push(
                <div key={i} className={`calendar-day ${isToday ? 'today' : ''} ${isVisited ? 'visited' : ''}`}>
                    {i}
                    {isVisited && <span className="visit-dot"></span>}
                </div>
            );
        }

        return calendarDays;
    };

    const handleEnroll = (courseTitle) => {
        localStorage.setItem('selectedCourse', courseTitle);
        navigate('/signup');
    };

    return (
        <div className={`page-container`}>
            {/* Top Header Section */}
            <header className="header">
                <div className="logo-container">
                    <FaGraduationCap className="logo-icon" />
                    <span className="logo-text">E-LEARN</span>
                </div>
                <div className="header-content">
                    <h1 className="college-name">VIVEK COLLEGE OF COMMERCE</h1>
                    <h3 className="sub-text">(Autonomous)</h3>
                </div>
            </header>

            {/* Main Content */}
            <div className="main-content">

                <div className="left-column">
                    {/* Exploration Grid */}
                    <div className="courses-section-mini">
                        <h2 className="course-section-title">
                            <FaBookOpen style={{ marginRight: '15px' }} />
                            Explore Our Courses
                        </h2>
                        <div className="course-box-grid">
                            {courses.map(course => (
                                <CourseBox
                                    key={course.id}
                                    title={course.title}
                                    description={course.description}
                                    image={course.image || itImg}
                                    onClick={() => handleEnroll(course.title)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick Enrollment Grid */}
                    <div className="quick-enroll-section">
                        <h2 className="course-section-title">
                            <FaGraduationCap style={{ marginRight: '15px' }} />
                            Quick Enrollment
                        </h2>
                        <div className="enrollment-grid">
                            {courses.map(course => (
                                <CourseBox
                                    key={course.id}
                                    title={course.title}
                                    description={course.description}
                                    image={course.image || itImg}
                                    onClick={() => handleEnroll(course.title)}
                                    actionText="Enroll Now"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calendar Section Wrapper */}
                <div className="right-column">
                    <h2 className="section-title">
                        <FaCalendarAlt style={{ marginRight: '10px' }} />
                        Academic Calendar - {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
                    </h2>
                    <div className="calendar-container">
                        <div className="week-days">
                            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                        </div>
                        <div className="calendar-grid">
                            {renderCalendar()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-params">
                <button onClick={() => navigate('/login')} className="login-btn">Login / Sign Up</button>
            </div>

            {/* Footer Section */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <p><FaMapMarkerAlt /> Siddharth Nagar, Goregaon (W), Mumbai 400104</p>
                        <p><FaPhone /> 022 2872 4058</p>
                        <p><FaEnvelope /> vivekcollege@gmail.com</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li onClick={() => navigate('/')}>Home</li>
                            <li onClick={() => navigate('/student')}>Student Portal</li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <FaFacebook className="social-icon" />
                            <FaTwitter className="social-icon" />
                            <FaLinkedin className="social-icon" />
                            <FaInstagram className="social-icon" />
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} Vivek College of Commerce. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;

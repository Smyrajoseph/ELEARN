# E-Learn Platform - Production-Ready Full-Stack Application

## Overview
E-Learn is a comprehensive Learning Management System (LMS) built with React and Express, featuring user authentication, course management, video lessons, quizzes, and role-based access control for students and teachers.

## Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React Icons** - Icon library

### Backend
- **Express 5** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## Project Structure
```
E-Learn/
├── E-Learn-frontend/          # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/          # React contexts (Auth, Progress)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   └── App.js           # Main app component
│   └── .env                 # Frontend environment variables
│
└── ELEARN Backend/
    └── server/              # Express backend
        ├── config/          # Database configuration
        ├── controllers/     # Route controllers
        ├── middleware/      # Auth & validation middleware
        ├── models/          # Mongoose models
        ├── routes/          # API routes
        └── .env            # Backend environment variables
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd "ELEARN Backend/server"
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_EXPIRE=7d
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd E-Learn-frontend
```

2. Install dependencies (axios already installed):
```bash
npm install
```

3. Environment variables are configured in `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Features Implemented

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student/Teacher)
- Protected routes
- Secure password hashing with bcrypt
- Token management with auto-refresh

### ✅ API Integration
- Centralized API client with axios
- Request/response interceptors
- Global error handling
- Automatic token injection
- Network error handling

### ✅ User Management
- Student registration & profile
- Teacher registration & profile
- User authentication
- Profile updates

### ✅ Course Management
- Course creation (Teacher)
- Course listing
- Course enrollment
- Enrollment requests & approval system

### ✅ Content Management
- Video lessons
- Quizzes with auto-grading
- Assignments & submissions
- Progress tracking

### ✅ Production Features
- Error boundaries for graceful error handling
- Loading states & spinners
- Toast notifications
- CORS configuration
- Environment-based configuration
- Protected API endpoints

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses/create` - Create course (Teacher)
- `PUT /api/courses/:id` - Update course (Teacher)
- `DELETE /api/courses/:id` - Delete course (Teacher)

### Enrollments
- `POST /api/enrollments` - Request enrollment
- `GET /api/enrollments/my` - Get my enrollments
- `GET /api/enrollments/:courseId/:yearId/requests` - Get requests (Teacher)
- `PATCH /api/enrollments/:requestId/status` - Approve/reject (Teacher)

### Content
- `GET /api/video/courses/:courseId/video` - Get course videos
- `POST /api/video/courses/:courseId/video` - Upload video (Teacher)
- `GET /api/quiz/:quizId` - Get quiz
- `POST /api/quiz/:quizId/submit` - Submit quiz answers
- `GET /api/subjects` - Get subjects
- `GET /api/assignment` - Get assignments
- `POST /api/submission` - Submit assignment

## Usage

### For Students
1. **Sign Up**: Register with student role and select your course
2. **Login**: Use your credentials to access the student dashboard
3. **Browse Courses**: View enrolled courses and available content
4. **Watch Videos**: Access video lessons and track progress
5. **Take Quizzes**: Complete quizzes and view scores
6. **Submit Assignments**: Upload assignment submissions

### For Teachers
1. **Sign Up**: Register with teacher role
2. **Login**: Access the teacher dashboard
3. **Manage Courses**: Create and update courses
4. **Upload Content**: Add videos, quizzes, and assignments
5. **Review Enrollments**: Approve or reject student enrollment requests
6. **Grade Submissions**: Review and grade student work

## Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Secure token storage
- ✅ Auto-logout on token expiry

## Development

### Running Tests
```bash
# Frontend tests
cd E-Learn-frontend
npm test

# Backend tests (if configured)
cd "ELEARN Backend/server"
npm test
```

### Building for Production

#### Frontend
```bash
cd E-Learn-frontend
npm run build
```

This creates an optimized production build in the `build/` directory.

#### Backend
The backend is production-ready. For deployment:
1. Set `NODE_ENV=production` in .env
2. Update `FRONTEND_URL` to your production frontend URL
3. Ensure MongoDB connection is stable
4. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name elearn-backend
```

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Configure production database
- [ ] Set up SSL/HTTPS
- [ ] Configure production CORS origins
- [ ] Enable rate limiting
- [ ] Set up logging (Winston/Morgan)
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (e.g., New Relic, Datadog)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Check that `FRONTEND_URL` in backend .env matches frontend URL
- Verify CORS configuration in `server.js`

### Authentication Issues
- Clear browser localStorage and cookies
- Verify JWT_SECRET is set in backend .env
- Check that token is being sent in request headers

### Database Connection
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - feel free to use this project for learning or commercial purposes.

## Support
For issues or questions, please open an issue on the repository.

---

**Built with ❤️ for education**

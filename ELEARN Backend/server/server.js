import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
//Auth 
import authRoutes from "./routes/Auth/authRoutes.js";
import enrollmentRoutes from "./routes/Auth/enrollmentRoutes.js";
import profilesRoutes from './routes/Auth/profilesRoutes.js';
import rolesRouter from "./routes/Auth/rolesRoutes.js";
import teacherRoutes from "./routes/Auth/teacherRoutes.js";
import userRoutes from "./routes/Auth/userRoutes.js";

//Course
import courseRoutes from "./routes/Content/courseRoutes.js";
import courseYearRoutes from "./routes/Course/courseYearRoutes.js";

//Content
import subjectRoutes from "./routes/Content/subjectRoutes.js";
import videoRoutes from "./routes/Content/videoRoutes.js";
import quizRoutes from "./routes/Content/quizRoutes.js";
import assignmentRoutes from "./routes/Content/assignmentRoutes.js";
import submissionRoutes from "./routes/Content/submissionRoutes.js";
import lessonRoutes from "./routes/Content/lessonRoutes.js";
import noteRoutes from "./routes/Content/noteRoutes.js";
// Other routes
import protectedRouter from "./routes/protectedRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";


// import path from "path";

dotenv.config();
const app = express();

app.use(express.json());

// CORS configuration for production
const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Health check endpoint (before DB dependency)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//Auth
app.use("/api/auth", authRoutes);
app.use("/api/roles", rolesRouter);
app.use("/api/profiles", profilesRoutes);
app.use("/api/teacher", teacherRoutes)
app.use("/api/enrollments", enrollmentRoutes); 
app.use("/api/users", userRoutes);

//Course
app.use("/api/course-years", courseYearRoutes);
app.use("/api/courses", courseRoutes);

//Content
app.use("/api/subjects", subjectRoutes);
app.use("/api/quiz", quizRoutes); //
app.use("/api/notes", noteRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/submission", submissionRoutes);
app.use("/api/lesson", lessonRoutes);

// Other routes
app.use("/protected", protectedRouter);
app.use("/files", fileRoutes);

// Initialize DB and start server
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    console.log("✅ Database connected successfully");
    
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
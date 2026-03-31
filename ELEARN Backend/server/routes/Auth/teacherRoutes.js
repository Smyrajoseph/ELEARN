import express from "express";
import { authenticate } from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/rbac.js";
import {
  getTeacherCourses,
  getCourseEnrollments,
  getAssignmentSubmissions,
  gradeSubmission,
  getCourseAnalytics
} from "../../controllers/Auth/teacherController.js";

const router = express.Router();

// Teacher-only routes
router.get("/teacher/courses", authenticate, requireRole(["teacher"]), getTeacherCourses);
router.get("/teacher/courses/:courseId/enrollments", authenticate, requireRole(["teacher"]), getCourseEnrollments);
router.get("/teacher/assignments/:assignmentId/submissions", authenticate, requireRole(["teacher"]), getAssignmentSubmissions);
router.put("/teacher/submissions/:submissionId/grade", authenticate, requireRole(["teacher"]), gradeSubmission);

// Analytics
router.get("/teacher/courses/:courseId/analytics", authenticate, requireRole(["teacher"]), getCourseAnalytics);

export default router;
import express from "express";
import { requestEnrollment, getStudentEnrollments, cancelEnrollmentRequest, getEnrollmentRequests, updateEnrollmentStatus, getCourseYearEnrollments, unenrollStudent, getAllTeacherEnrollmentRequests } from "../../controllers/Auth/enrollmentController.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { teacherMiddleware } from "../../middleware/teacherMiddleware.js";
const router = express.Router();

router.post("/", authenticate, requestEnrollment);
router.get("/my", authenticate, getStudentEnrollments);
router.delete("/:requestId/cancel", authenticate, cancelEnrollmentRequest);
router.get("/teacher/requests", authenticate, teacherMiddleware, getAllTeacherEnrollmentRequests);
router.get("/:courseId/:yearId/requests", authenticate, teacherMiddleware, getEnrollmentRequests);
router.patch("/:requestId/status", authenticate, teacherMiddleware, updateEnrollmentStatus);
router.get("/:courseId/:yearId/students", authenticate, teacherMiddleware, getCourseYearEnrollments);
router.delete("/:courseId/:yearId/:studentId/unenroll", authenticate, teacherMiddleware, unenrollStudent);

export default router;
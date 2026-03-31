import express from "express";
import { getCourseYears, addYearToCourse, updateYear, deleteYear } from "../../controllers/Course/courseYearController.js";
import { requireRole } from "../../middleware/rbac.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public (students can view their own year)
router.get("/:courseId/years", authenticate, getCourseYears);

// Protected (teachers/admins manage years)
router.post("/:courseId/years", authenticate, requireRole(["teacher", "admin"]), addYearToCourse);
router.put("/:courseId/years/:yearId", authenticate, requireRole(["teacher", "admin"]), updateYear);
router.delete("/:courseId/years/:yearId", authenticate, requireRole(["teacher", "admin"]), deleteYear);

export default router;
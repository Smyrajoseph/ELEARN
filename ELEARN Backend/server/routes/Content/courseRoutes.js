import express from "express";
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } from "../../controllers/Course/courseController.js";
import { requireRole } from "../../middleware/rbac.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public (students can view)
router.get("/", authenticate, getCourses);
router.get("/:id", authenticate, getCourseById);

// Protected (only teachers/admins can modify)
router.post("/create", authenticate, requireRole(["teacher", "admin"]), createCourse);
router.put("/:id", authenticate, requireRole(["teacher", "admin"]), updateCourse);
router.delete("/:id", authenticate, requireRole(["teacher", "admin"]), deleteCourse);

export default router;
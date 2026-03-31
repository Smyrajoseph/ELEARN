import express from "express";
import multer from "multer";
import { submitAssignment, getMySubmissions, gradeSubmission } from "../../controllers/Content/submissionController.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/rbac.js";

const router = express.Router();
const upload = multer(); // memory storage

// Student: submit assignment
router.post("/assignment/:id/submit",authenticate,requireRole(["student"]), upload.single("file"), submitAssignment);

// Student: get their submissions
router.get("/submission/me", authenticate,requireRole(["student"]), getMySubmissions);

// Instructor: grade a submission
router.put("/submission/:id/grade", authenticate, requireRole(["teacher"]), gradeSubmission);

export default router;
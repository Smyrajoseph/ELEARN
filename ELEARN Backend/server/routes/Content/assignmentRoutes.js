import { Router } from "express";
import multer from "multer";
import {createAssignment,getAssignments,submitAssignment,getSubmissions} from "../../controllers/Content/assignmentController.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/rbac.js";
const router = Router();
const upload=multer();
// Assignments
router.post("/courses/:id/assignment",authenticate, requireRole(["teacher"]), upload.single("file"), createAssignment);
router.get("/courses/:id/assignment", authenticate, getAssignments);

// Submissions
router.post("/assignment/:id/submit", authenticate, upload.single("file"), submitAssignment);
router.get("/assignment/:id/submission", authenticate, getSubmissions);

export default router;
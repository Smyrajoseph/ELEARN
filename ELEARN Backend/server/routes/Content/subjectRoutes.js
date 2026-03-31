import express from "express";
import {
  addSubject,
  getSubjectsByCourse,
  updateSubject,
  deleteSubject
} from "../../controllers/Content/subjectController.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/rbac.js";

const router = express.Router();

// CREATE (teacher only)
router.post("/", authenticate, requireRole(["teacher"]), addSubject);

// READ
router.get("/:courseId", authenticate, getSubjectsByCourse);

// UPDATE (teacher only)
router.put("/:subjectId", authenticate, requireRole(["teacher"]), updateSubject);

// DELETE (teacher only)
router.delete("/:subjectId", authenticate, requireRole(["teacher"]), deleteSubject);

export default router;
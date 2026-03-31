import { Router } from "express";
import { getNoteBySubject, upsertNote } from "../../controllers/Content/noteController.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = Router();

// Student can get their note for a specific subject
router.get("/:subjectId", authenticate, getNoteBySubject);

// Student can save their note for a specific subject
router.post("/", authenticate, upsertNote);

export default router;

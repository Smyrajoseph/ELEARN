import { Router } from "express";
import multer from "multer";
import { addLesson, getLessons,updateLesson,deleteLesson,  } from "../../controllers/Content/lessonController.js";
import { authenticate, requireEnrollment } from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/rbac.js";
const router = Router();
const upload=multer();
// content Routes
router.post("/courses/:id/:yearId/lessons", authenticate, requireRole(["teacher"]), upload.single("attachment"), addLesson);
router.get("/courses/:id/:yearId/lessons", authenticate, requireEnrollment, getLessons);
router.put("/lessons/:lessonId", authenticate, requireRole(["teacher"]), updateLesson);
router.delete("/lessons/:lessonId", authenticate, requireRole(["teacher"]), deleteLesson);

export default router;
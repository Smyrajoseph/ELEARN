// contentRoutes.js
import { Router } from "express";
import multer from "multer";
import { 
  createQuiz,
  createGeneralQuiz,
  addQuestion,
  addOption,
  getQuiz, 
  submitResponse,
  getQuizResults,
  getQuizzesBySubject,
  getQuizById,
  submitFullQuiz
} from "../../controllers/Content/quizController.js";
import { authenticate, requireEnrollment } from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/rbac.js";
const router = Router();
const upload=multer();

// quiz Routes
router.post("/", authenticate, requireRole(["teacher"]), upload.single("quizFile"), createGeneralQuiz);
router.post("/lessons/:lessonId/quizzes", authenticate, requireRole(["teacher"]), createQuiz);
router.post("/quizzes/:quizId/questions", authenticate, requireRole(["teacher"]), addQuestion);
router.post("/questions/:questionId/options", authenticate, requireRole(["teacher"]), addOption);
router.get("/lessons/:lessonId/quiz", authenticate, requireEnrollment, getQuiz);
router.get("/subject/:subjectId", authenticate, requireEnrollment, getQuizzesBySubject);
router.get("/:quizId", authenticate, requireEnrollment, getQuizById);
router.post("/questions/:questionId/responses", authenticate, requireRole(["student"]), submitResponse);
router.post("/:quizId/submit", authenticate, requireRole(["student"]), submitFullQuiz);
router.get("/quizzes/:quizId/results", authenticate, requireRole(["student"]), getQuizResults);

export default router;
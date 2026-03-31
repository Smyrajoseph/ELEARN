// routes/Auth/userRoutes.js
import express from 'express';
import { updateTimeSpent, getLearningStats, markVideoCompleted } from '../../controllers/Auth/userController.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Get learning statistics
router.get('/stats', authenticate, getLearningStats);

// Update time spent
router.post('/time', authenticate, updateTimeSpent);

// Mark video as completed
router.post('/video-complete/:videoId', authenticate, markVideoCompleted);

export default router;

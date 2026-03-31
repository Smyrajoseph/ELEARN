// routes/authRoutes.js
import express from 'express';
import { register, login, logout, getMe, verifyEmail } from "../../controllers/Auth/authController.js";
import { authenticate } from '../../middleware/authMiddleware.js';
import {body, validationResult} from 'express-validator';

const router = express.Router();

router.get('/verify-email', verifyEmail);
router.post('/register',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('name').notEmpty().withMessage('Full name is required'),
        body('role').isIn(['student', 'teacher']).withMessage('Role must be either student or teacher'),
    ],(req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }, register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);  // protected route

export default router;
import express from 'express';
import { register, login, getMe, verifyOTP, getUser, logout, forgotPassword, resetPassword, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/user/:id', protect, getUser);
router.post('/logout', protect, logout);

export default router;
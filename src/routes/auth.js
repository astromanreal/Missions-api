import express from 'express';
import { register, login, getMe, verifyOTP, getUser, logout, forgotPassword, resetPassword } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getMe);
router.get('/user/:id', auth, getUser);
router.post('/logout', auth, logout);

export default router;
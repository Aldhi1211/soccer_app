import express from 'express';
import passport from 'passport';
import { googleCallback, refreshToken, login, register, verifyEmail } from '../controllers/auth/authController.js';
import { loginLimiter } from '../middleware/login-limitter.js';

const router = express.Router();


router.get('/refresh-token', refreshToken);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/', session: false }),
    googleCallback);

router.get('/login', loginLimiter, login);
router.post('/register', register);
router.get('/verify-email', verifyEmail);

export default router;

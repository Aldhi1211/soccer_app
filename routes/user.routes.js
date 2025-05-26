import express from 'express';
import { verifyToken } from '../middleware/verify-token.js';
import { getProfile } from '../controllers/users/userController.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);

export default router;

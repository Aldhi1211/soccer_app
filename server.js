import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import './config/passport.js'; // pastikan ini dipanggil agar strategi aktif

import users from './routes/user.routes.js'
import { connectDB } from './config/database.js';

dotenv.config();
connectDB(); // panggil sebelum app.listen

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/users', users);

app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Login with Google</a>');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

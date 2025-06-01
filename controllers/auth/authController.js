import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../../utils/sendEmail.js';

export const googleCallback = (req, res) => {
    // Buat JWT
    const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.REFRESH_SECRET,
        { expiresIn: '1d' } // 1 hari
    );

    // Kirim refresh token via cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 hari
        secure: false, // set true kalau pakai HTTPS
        sameSite: 'Lax'
    });

    // Redirect ke frontend (atau kirim token sebagai response JSON)
    res.json({
        success: true,
        message: "Login Successful",
        token: token,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            photo: req.user.photo
        }
    });
}

export const refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            success: true,
            token: newAccessToken
        });

    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
        return res.status(403).json({ success: false, message: 'Email belum diverifikasi.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_SECRET,
        { expiresIn: '1d' }
    );

    // ⬇️ Simpan refresh token ke cookie (HTTPOnly agar aman)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 hari
    });

    res.json({
        success: true,
        message: "Login successful",
        accessToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Cek apakah user sudah ada
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.authProvider === 'google') {
                return res.status(400).json({
                    success: false,
                    message: 'Email ini sudah digunakan melalui Google login. Silakan login dengan Google.'
                });
            }

            return res.status(409).json({ message: 'Email sudah terdaftar.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru
        const user = new User({ name, email, password: hashedPassword, authProvider: "local" });

        const token = crypto.randomBytes(32).toString('hex');
        user.verificationToken = token;
        await user.save();

        // Buat link verifikasi
        const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`;

        await sendEmail({
            to: user.email,
            subject: 'Verifikasi Email',
            html: `<p>Hai ${user.name}, klik link berikut untuk verifikasi email:</p><a href="${verificationUrl}">Verifikasi Email</a>`
        });

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("❌ Register Error:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
};


export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        return res.status(400).json({ success: false, message: 'Token tidak valid.' });
    }

    // Saat user klik link verifikasi
    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: 'Email berhasil diverifikasi.' });
};

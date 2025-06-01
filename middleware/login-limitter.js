import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 5, // max 5 request per IP
    message: {
        success: false,
        message: 'Terlalu banyak percobaan login. Coba lagi nanti.'
    },
    standardHeaders: true, // kirim rate-limit info ke client
    legacyHeaders: false,
});

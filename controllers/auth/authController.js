import jwt from 'jsonwebtoken';

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

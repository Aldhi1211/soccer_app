export const getProfile = (req, res) => {
    res.json({
        success: true,
        message: 'Token valid. Ini data user.',
        user: req.user
    });
};

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    photo: String,
    createdAt: { type: Date, default: Date.now },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    isVerified: { type: Boolean, default: false },
    emailVerifiedAt: {
        type: Date,
        default: null
    },
    verificationToken: String

});

export default mongoose.model('User', userSchema);

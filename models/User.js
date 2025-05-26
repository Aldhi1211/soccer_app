import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    photo: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);

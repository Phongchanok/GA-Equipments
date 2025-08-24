// src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
username: { type: String, unique: true, required: true },
passwordHash: { type: String, required: true },
name: { type: String, required: true },
role: { type: String, enum: ['admin', 'inspector', 'user'], required: true },
// Optional inspector code for quick verify flow on equipment-detail
code: { type: String, index: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
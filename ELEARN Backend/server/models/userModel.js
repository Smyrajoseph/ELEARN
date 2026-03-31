// models/userModel.js
import mongoose from 'mongoose';

const User = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  name: { type: String, required: true },
  course: { type: [String] }, // To store the courses selected during registration
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  timeSpent: { type: Number, default: 0 }, // Learning time in seconds
  completedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }], // Array of completed video IDs
  createdAt: { type: Date, default: Date.now }   // ✅ moved inside schema object
});

export default mongoose.model('User', User);
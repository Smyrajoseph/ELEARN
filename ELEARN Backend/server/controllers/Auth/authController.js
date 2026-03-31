// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/userModel.js';
import Course from '../../models/Course.js';
import { getDb } from "../../mongo.js";
import crypto from 'crypto';
import { sendVerificationEmail } from '../../services/emailService.js';


// REGISTER
export const register = async (req, res) => {
  try {
    const { email, password, role, name, course } = req.body;
    console.log(` Backend: Processing registration for ${email}. Courses received:`, course);

    if (!role) return res.status(400).json({ error: "Role is required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      passwordHash,
      role,
      name,
      course: Array.isArray(course) ? course : (course ? [course] : []),
      verificationToken,
      isVerified: false
    });

    // Send Verification Email
    try {
        await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
        console.error('Email sending failed during registration:', emailError);
        // Delete the user record if email was not sent, so they can try again once they fix credentials
        await User.findByIdAndDelete(user._id);
        throw new Error('Failed to send verification email. Please check your email configuration in .env');
    }

    const profiles = getDb().collection("profiles");
    await profiles.insertOne({
      user_id: user._id,
      full_name: name,
      role,
      course,
      avatar_url: "",
      created_at: new Date()
    });

    if (role === 'teacher' && Array.isArray(course) && course.length > 0) {
      for (const title of course) {
        const existing = await Course.findOne({ title, teacher_id: user._id.toString() });
        if (!existing) {
          await Course.create({
            title,
            description: "Course assigned during registration.",
            teacher_id: user._id.toString(),
            createdBy: user._id
          });
        }
      }
      console.log(`Ensured ${course.length} courses exist for teacher ${name}`);
    }

    res.status(201).json({ 
        message: "Registration successful! Please check your email to verify your account.", 
        id: user._id 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Using Mongoose instead of raw collection to ensure schema fields like 'course' are included
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
          error: "Please verify your email address before logging in.",
          needsVerification: true 
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`oaded user from DB: ${user.name}, course list:`, user.course);

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course || [] // Ensure it is at least an empty array
    };

    const expiresIn = process.env.JWT_EXPIRE || '7d';
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

    console.log(` Login successful for user: ${email} (${user.role})`);
    res.json({
      token,
      user: payload,
      expiresIn,
      message: "Login successful"
    });
  } catch (err) {
    console.error(' Login error:', err);
    res.status(500).json({ error: err.message });
  }
};
// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// In-memory blacklist (for demo; use DB/Redis in production)
const blacklistedTokens = new Set();
// LOGOUT
export const logout = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) blacklistedTokens.add(token);
  res.json({ message: "Logged out and token invalidated" });
};

export const isTokenBlacklisted = (token) => blacklistedTokens.has(token);


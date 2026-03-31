import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../controllers/Auth/authController.js";

// Verify JWT and attach payload
export const authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  if (isTokenBlacklisted(token)) return res.status(401).json({ error: "Token invalidated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, course_id?, year_number? }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Teacher-only guard
export const requireTeacher = (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Only teachers can perform this action" });
  }
  next();
};

// Student enrollment guard
export const requireEnrollment = (req, res, next) => {
  const { courseId, yearId } = req.params;

  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Only students can access this content" });
  }

  if (req.user.course_id !== courseId || req.user.year_number !== yearId) {
    return res.status(403).json({ error: "You are not enrolled in this course/year" });
  }

  next();
};
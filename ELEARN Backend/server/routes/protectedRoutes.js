import express from "express";
import Profile from "../models/Profile.js"; // make sure Profile schema is defined
import { authenticate } from "../middleware/authMiddleware.js"; // ensures req.user is set

const router = express.Router();

// Teacher-only protected route
router.get("/teacher-only", authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user.id });

    if (profile?.role === "teacher") {
      res.json({ message: "Welcome, teacher! You can access this resource." });
    } else {
      res.status(403).json({ error: "Forbidden: only teachers allowed." });
    }
  } catch (err) {
    console.error("Error checking role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
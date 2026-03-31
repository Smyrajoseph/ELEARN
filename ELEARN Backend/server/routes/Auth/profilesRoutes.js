import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles,
} from "../../controllers/Auth/profileController.js";
import { authenticate } from "../../middleware/authMiddleware.js"; // adjust path if needed

const router = express.Router();

// Current user's profile
router.get("/me", authenticate, getProfile);

// Update current user's profile
router.put("/me", authenticate, updateProfile);

// Delete a profile (student can delete their own, teacher/admin can delete others)
router.delete("/:id", authenticate, deleteProfile);

// Teacher/Admin: get all profiles
router.get("/", authenticate, getAllProfiles);

export default router;
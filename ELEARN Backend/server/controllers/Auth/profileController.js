import Profile from "../../models/Profile.js";
import mongoose from "mongoose";

// Helper: check access
function canAccessProfile(req, res) {
  if (req.user.role === "student" && req.user.id !== req.params.id) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

// Get current user's profile
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update profile info (name, role, avatar, preferences)
export const updateProfile = async (req, res) => {
  try {
    const { full_name, role, preferences } = req.body;
    const updateFields = { full_name, role, preferences, updated_at: new Date() };

    if (req.file) {
      // GridFS for avatar uploads
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "attachments",
      });
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { userId: req.user.id, type: "avatar" },
      });
      uploadStream.end(req.file.buffer);
      updateFields.avatar_url = `/files/${uploadStream.id}`;
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: req.user.id },
      { $set: updateFields },
      { new: true }
    );

    res.json(updatedProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    if (!canAccessProfile(req, res)) return;

    const { id } = req.params;
    const result = await Profile.deleteOne({ user_id: id });

    res.json({ message: "Profile deleted", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Teacher/Admin: get all profiles
export const getAllProfiles = async (req, res) => {
  try {
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const profiles = await Profile.find({}, { password: 0 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
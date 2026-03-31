import express from "express";
import User from "../../models/userModel.js";

const router = express.Router();

// Update user role
router.post("/update-role", async (req, res) => {
  try {
    const { user_id, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $set: { role } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User role updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
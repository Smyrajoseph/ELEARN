// controllers/Auth/userController.js
import User from "../../models/userModel.js";
import { Response } from "../../models/Response.js";
import Lesson from "../../models/Lesson.js";

/**
 * Increment the user's total time spent on the platform.
 * Expects { additionalSeconds: Number } in the body.
 */
export const updateTimeSpent = async (req, res) => {
  const { additionalSeconds } = req.body;
  const userId = req.user.id;

  if (!additionalSeconds || isNaN(additionalSeconds)) {
    return res.status(400).json({ error: "Invalid additionalSeconds" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.timeSpent = (user.timeSpent || 0) + Number(additionalSeconds);
    await user.save();

    res.json({ message: "Time updated successfully", totalTime: user.timeSpent });
  } catch (error) {
    console.error("Error updating time spent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Fetch unified learning statistics for a student.
 */
export const getLearningStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('completedVideos');
    if (!user) return res.status(404).json({ error: "User not found" });

    // Count unique quizzes solved by this student
    const quizResponseCount = await Response.distinct("quiz_id", { student_id: userId });
    
    res.json({
      timeSpent: user.timeSpent || 0,
      completedVideos: user.completedVideos.map(v => v._id),
      quizzesSolved: quizResponseCount.length,
      userCourse: user.course
    });
  } catch (error) {
    console.error("Error fetching learning stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Mark a video as completed in the database.
 */
export const markVideoCompleted = async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.completedVideos.includes(videoId)) {
            user.completedVideos.push(videoId);
            await user.save();
        }

        res.json({ message: "Video marked as completed", completedVideos: user.completedVideos });
    } catch (error) {
        console.error("Error marking video completed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

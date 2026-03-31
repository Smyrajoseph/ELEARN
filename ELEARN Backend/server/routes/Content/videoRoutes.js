import express from "express";
import multer from "multer";
import { uploadVideo, getVideos, updateVideo, deleteVideo, getTeacherVideos, getVideoById } from "../../controllers/Content/videoController.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer(); // memory storage

// Get all videos uploaded by the current teacher
router.get("/my-videos", authenticate, getTeacherVideos);

// Upload video
router.post("/courses/:id/video", authenticate, upload.single("video"), uploadVideo);

// Get all videos for a course
router.get("/courses/:id/video", getVideos);

// Get a single video by ID
router.get("/:videoId", getVideoById);

// Update video
router.put("/video/:videoId", authenticate, upload.single("video"), updateVideo);

// Delete video
router.delete("/video/:videoId", authenticate, deleteVideo);

export default router;
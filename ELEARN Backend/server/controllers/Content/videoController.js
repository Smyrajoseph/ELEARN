import { getDb, getBucket } from "../../mongo.js";
import mongoose from "mongoose";

const getObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

// Upload content (teacher only)
export const uploadVideo = async (req, res) => {
  const { id } = req.params; // courseId
  const { title, description, subject_id, year_id } = req.body;
  const contentType = req.body.type || "video"; // Explicitly get from body

  try {
    let fileUrl = null;
    if (req.file) {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { courseId: id, subjectId: subject_id, type: contentType }
      });
      uploadStream.end(req.file.buffer);
      fileUrl = `/files/${uploadStream.id}`;
    }

    const videos = getDb().collection("video");
    const result = await videos.insertOne({
      course_id: id,
      subject_id: subject_id,
      year_id: year_id,
      title,
      description,
      video_url: fileUrl,
      type: contentType, // Force save as 'video' or 'document'
      uploaded_by: req.user.id,
      createdAt: new Date()
    });

    res.json({ id: result.insertedId, title, description, video_url: fileUrl, type: contentType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all videos for a course (flexible ID matching)
export const getVideos = async (req, res) => {
  const { id } = req.params;
  try {
    const { ObjectId } = await import("mongodb");
    const db = getDb();
    const videoCollection = db.collection("video");
    const subjectCollection = db.collection("subjects");
    
    // Try matching both string and ObjectId formats for robustness
    let query = {
      $or: [
        { course_id: id }
      ]
    };

    // Only attempt ObjectId conversion if it's a valid ObjectId
    const oid = getObjectId(id);
    if (oid) {
      query.$or.push({ course_id: oid });
    }

    console.log('🔍 GET VIDEOS QUERY TRACE:', JSON.stringify(query));
    const data = await videoCollection.find(query).toArray();
    console.log(`🎬 TOTAL VIDEOS FOUND (DB RAW): ${data.length} for course: ${id}`);
    const enrichedData = await Promise.all(data.map(async (v) => {
      if (v.subject_id) {
        try {
          const oid = getObjectId(v.subject_id);
          const subQuery = {
            $or: [
              { _id: v.subject_id },
              { _id: oid }
            ].filter(q => q._id !== null)
          };
          const subject = await subjectCollection.findOne(subQuery);
          return { ...v, subject };
        } catch (subErr) {
          console.error('Error fetching subject for video:', subErr);
          return v;
        }
      }
      return v;
    }));

    res.json(enrichedData);
  } catch (err) {
    console.error('getVideos error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single video by ID
export const getVideoById = async (req, res) => {
  const { videoId } = req.params;
  try {
    const oid = getObjectId(videoId);
    if (!oid) return res.status(400).json({ error: "Invalid Video ID" });

    const videos = getDb().collection("video");
    const data = await videos.findOne({ _id: oid });
    if (!data) return res.status(404).json({ error: "Video not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all videos uploaded by a teacher
export const getTeacherVideos = async (req, res) => {
  try {
    const videos = getDb().collection("video");
    const data = await videos.find({ uploaded_by: req.user.id }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update video (with optional new file and metadata)
export const updateVideo = async (req, res) => {
  const { videoId } = req.params;
  const { title, description, subject_id, year_id, type } = req.body;

  try {
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (subject_id) updateFields.subject_id = subject_id;
    if (year_id) updateFields.year_id = year_id;
    if (type) updateFields.type = type;

    if (req.file) {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { videoId, subjectId: subject_id, type: type || "video" }
      });
      uploadStream.end(req.file.buffer);
      updateFields.video_url = `/files/${uploadStream.id}`;
    }

    const oid = getObjectId(videoId);
    if (!oid) return res.status(400).json({ error: "Invalid Video ID" });

    const videos = getDb().collection("video");
    const result = await videos.findOneAndUpdate(
      { _id: oid },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    const updatedVideo = result?.value || result;
    if (!updatedVideo || !updatedVideo._id) return res.status(404).json({ error: "Video not found" });
    res.json(updatedVideo);
  } catch (err) {
    console.error('Update video error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  const { videoId } = req.params;

  try {
    const oid = getObjectId(videoId);
    if (!oid) return res.status(400).json({ error: "Invalid Video ID" });

    const videos = getDb().collection("video");
    const result = await videos.deleteOne({ _id: oid });
    res.json({ message: "Video deleted successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
import { getDb, getBucket } from "../../mongo.js";
import { ObjectId } from "mongodb";

// Create lesson (with optional attachment)
export const addLesson = async (req, res) => {
  const { id } = req.params; // courseId
  const { title, description, order_no } = req.body;

  try {
    let attachmentUrl = null;

    if (req.file) {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { courseId: id, type: "lesson" }
      });
      uploadStream.end(req.file.buffer);
      const fileId = uploadStream.id.toString();
      attachmentUrl = `/files/${fileId}`;
    }

    const contents = getDb().collection("content");
    const result = await contents.insertOne({
      course_id: id,
      title,
      description,
      order_no,
      attachment_url: attachmentUrl
    });
    res.json(result.insertedId ? { id: result.insertedId, ...result.ops?.[0] } : result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all lessons for a course
export const getLessons = async (req, res) => {
  const { id } = req.params; // courseId
  try {
    const contents = getDb().collection("content");
    const data = await contents
      .find({ course_id: id })
      .sort({ order_no: 1 })
      .toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update lesson (with optional new attachment)
export const updateLesson = async (req, res) => {
  const { contentId } = req.params;
  const { title, description, order_no } = req.body;

  try {
    const updateFields = { title, description, order_no };

    if (req.file) {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { contentId, type: "lesson" }
      });
      uploadStream.end(req.file.buffer);
      const fileId = uploadStream.id.toString();
      updateFields.attachment_url = `/files/${fileId}`;
    }

    const contents = getDb().collection("content");
    if (!ObjectId.isValid(contentId)) return res.status(400).json({ error: "Invalid Content ID" });

    const result = await contents.findOneAndUpdate(
      { _id: new ObjectId(contentId) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    const updatedLesson = result?.value || result;
    if (!updatedLesson || !updatedLesson._id) return res.status(404).json({ error: "Lesson not found" });
    res.json(updatedLesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
  const { contentId } = req.params;

  try {
    if (!ObjectId.isValid(contentId)) return res.status(400).json({ error: "Invalid Content ID" });

    const contents = getDb().collection("content");
    const result = await contents.deleteOne({ _id: new ObjectId(contentId) });
    res.json({ message: "Lesson deleted successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

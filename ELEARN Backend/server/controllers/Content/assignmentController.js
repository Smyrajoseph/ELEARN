import { getDb, getBucket } from "../../mongo.js";

// Create assignment (with optional file upload)
export const createAssignment = async (req, res) => {
  const { id } = req.params; // courseId
  const { title, description, deadline } = req.body;

  try {
    let fileUrl = null;

    if (req.file) {
      const bucket = getBucket();
      // upload buffer directly to GridFS
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { courseId: id, type: "assignment" }
      });
      uploadStream.end(req.file.buffer);
      const fileId = uploadStream.id.toString();
      fileUrl = `/files/${fileId}`;
    }

    const assignments = getDb().collection("assignments");
    const result = await assignments.insertOne({
      course_id: id,
      title,
      description,
      deadline,
      file_url: fileUrl
    });

    res.json(result.insertedId ? { id: result.insertedId, ...result.ops?.[0] } : result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get assignments for a course
export const getAssignments = async (req, res) => {
  const { id } = req.params;
  try {
    const assignments = getDb().collection("assignments");
    const data = await assignments.find({ course_id: id }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit assignment (student upload)
export const submitAssignment = async (req, res) => {
  const { id } = req.params; // assignmentId
  try {
    let fileUrl = null;
    if (req.file) {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { assignmentId: id, type: "submission" }
      });
      uploadStream.end(req.file.buffer);
      const fileId = uploadStream.id.toString();
      fileUrl = `/files/${fileId}`;
    }

    const submissions = getDb().collection("submissions");
    const result = await submissions.insertOne({
      assignment_id: id,
      file_url: fileUrl,
      student_id: req.user.id
    });

    res.json(result.insertedId ? { id: result.insertedId, ...result.ops?.[0] } : result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Teacher: get all submissions for an assignment
export const getSubmissions = async (req, res) => {
  const { id } = req.params; // assignmentId
  try {
    const submissions = getDb().collection("submissions");
    const data = await submissions.find({ assignment_id: id }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
import { getDb, getBucket } from "../../mongo.js";
import { ObjectId } from "mongodb";
// Student: submit assignment (with file upload or file_url)
export async function submitAssignment(req, res) {
  const { id } = req.params; // assignmentId

  try {
    let fileUrl = req.body.file_url || null;

    // If a file is uploaded, store in GridFS
    if (req.file) {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { assignmentId: id, type: "submission" }
      });
      uploadStream.end(req.file.buffer);
      fileUrl = `/files/${uploadStream.id}`;
    }

    const submissions = getDb().collection("submissions");
    const result = await submissions.insertOne({ assignment_id: id, file_url: fileUrl, student_id: req.user.id });
    res.json({ id: result.insertedId, ...result.ops?.[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Student: get their own submissions
export async function getMySubmissions(req, res) {
  try {
    const submissions = getDb().collection("submissions");
    const data = await submissions.find({ student_id: req.user.id }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Instructor: grade a submission
export async function gradeSubmission(req, res) {
  const { submissionId } = req.params;
  const { grade } = req.body;

  try {
    if (!ObjectId.isValid(submissionId)) return res.status(400).json({ error: "Invalid Submission ID" });

    const submissions = getDb().collection("submissions");
    const result = await submissions.updateOne(
      { _id: new ObjectId(submissionId) },
      { $set: { grade } }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
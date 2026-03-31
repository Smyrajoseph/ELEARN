import { Subject } from "../../models/Subject.js";

// CREATE
export const addSubject = async (req, res) => {
  try {
    const { course_id, year_id, name } = req.body;
    const subject = await Subject.create({ course_id, year_id, name });
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ (all subjects by course_id)
export const getSubjectsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const subjects = await Subject.find({ course_id: courseId });
    res.json(subjects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE
export const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const updates = req.body;
    const subject = await Subject.findByIdAndUpdate(subjectId, updates, { new: true });
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
export const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findByIdAndDelete(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
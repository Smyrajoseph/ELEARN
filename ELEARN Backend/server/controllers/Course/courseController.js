import Course from "../../models/Course.js";
import { ObjectId } from "mongodb";

// Get all courses (with one placeholder + DB courses)
export const getCourses = async (req, res) => {
  try {
    const placeholder = { _id: "0", title: "Placeholder Course" };
    const data = await Course.find().lean();
    res.json([placeholder, ...data]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (id == 0) {
      return res.json({ id: 0, title: "Placeholder Course" });
    }

    const data = await Course.findById(id);
    if (!data) return res.status(404).json({ error: "Course not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, description, teacher_id } = req.body;
    if (!title || !description || !teacher_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if course already exists to avoid duplication
    const existing = await Course.findOne({ title, teacher_id });
    if (existing) return res.status(200).json({ course: existing });

    const newCourse = new Course({ title, description, teacher_id, createdBy: teacher_id });
    const result = await newCourse.save();
    console.log(` Course "${title}" created/matched in MongoDB`);
    return res.status(201).json({ course: result });
  } catch (err) {
    console.error(" Error creating course:", err);
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedCourse) return res.status(404).json({ error: "Course not found" });
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Course.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
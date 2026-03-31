import CourseYear from "../../models/Course.js"; 
import { getDb } from "../../mongo.js";
import { ObjectId } from "mongodb";

// Get years for a course (students only see their own year)
export const getCourseYears = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { role, year_number, course_id } = req.user;

    // Students can only access their own course + year
    let query = { course_id: courseId };

    if (role === "student") {
      if (courseId !== String(course_id)) {
        return res.status(403).json({ error: "Access denied: wrong course" });
      }
      query.year_number = Number(year_number);
    }

    const years = await CourseYear.find(query);

    if (!years || years.length === 0) {
      return res.status(404).json({ error: "No years found for this course" });
    }

    res.json(years);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add year to course
export const addYearToCourse = async (req, res) => {
  const { courseId } = req.params;
  const { year_number, year_label } = req.body;
  try {
    const years = getDb().collection("course_years");
    const result = await years.insertOne({
      course_id: new ObjectId(courseId),
      year_number,
      year_label,
      createdAt: new Date()
    });
    res.status(201).json({ id: result.insertedId, course_id: courseId, year_number, year_label });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update year
export const updateYear = async (req, res) => {
  const { courseId, yearId } = req.params;
  const { year_number, year_label } = req.body;
  try {
    const years = getDb().collection("course_years");
    const result = await years.findOneAndUpdate(
      { _id: new ObjectId(yearId), course_id: new ObjectId(courseId) },
      { $set: { year_number, year_label } },
      { returnDocument: "after" }
    );
    const updatedYear = result?.value || result;
    if (!updatedYear || !updatedYear._id) return res.status(404).json({ error: "Year not found" });
    res.json(updatedYear);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete year
export const deleteYear = async (req, res) => {
  const { courseId, yearId } = req.params;
  try {
    const years = getDb().collection("course_years");
    const result = await years.deleteOne({ _id: new ObjectId(yearId), course_id: new ObjectId(courseId) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Year not found" });
    res.json({ message: "Year deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
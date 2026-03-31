import { getDb } from "../../mongo.js";

// Get all courses created by the teacher
export const getTeacherCourses = async (req, res) => {
  try {
    const courses = getDb().collection("courses");
    const data = await courses.find({ teacher_id: req.user.id }).toArray();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get enrollments for a specific course
export const getCourseEnrollments = async (req, res) => {
  const { courseId } = req.params;
  try {
    const enrollments = getDb().collection("enrollment");
    const data = await enrollments.find({ course_id: courseId }).toArray();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get submissions for an assignment
export const getAssignmentSubmissions = async (req, res) => {
  const { assignmentId } = req.params;
  try {
    const submissions = getDb().collection("submissions");
    const data = await submissions.find({ assignment_id: assignmentId }).toArray();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Grade a submission
export const gradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;
  try {
    const submissions = getDb().collection("submissions");
    const result = await submissions.updateOne(
      { _id: new (require("mongodb").ObjectId)(submissionId) },
      { $set: { grade, feedback, graded_at: new Date() } }
    );
    res.json({ message: "Submission graded successfully", result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Course analytics: enrollment count, lesson completion %, submission rates, average grades
export const getCourseAnalytics = async (req, res) => {
  const { courseId } = req.params;

  try {
    const enrollments = getDb().collection("enrollment");
    const enrollmentCount = await enrollments.countDocuments({ course_id: courseId });

    // lesson completion
    const contentCol = getDb().collection("content");
    const contentList = await contentCol.find({ course_id: courseId }).project({ _id: 1 }).toArray();
    const lessonIds = contentList.map((c) => c._id);

    const progress = getDb().collection("content_progress");
    const completedCount = await progress.countDocuments({ lesson_id: { $in: lessonIds } });
    const contentCompletionRate =
      contentList.length > 0
        ? (completedCount / (enrollmentCount * contentList.length)) * 100
        : 0;

    // assignment/submission
    const assignments = getDb().collection("assignment");
    const assignmentList = await assignments.find({ course_id: courseId }).project({ _id: 1 }).toArray();
    const assignmentIds = assignmentList.map((a) => a._id);

    const submissions = getDb().collection("submissions");
    const submissionCount = await submissions.countDocuments({ assignment_id: { $in: assignmentIds } });
    const submissionRate =
      assignmentIds.length > 0
        ? (submissionCount / (enrollmentCount * assignmentIds.length)) * 100
        : 0;

    // average grade
    const gradesCursor = submissions.find({ assignment_id: { $in: assignmentIds } }, { projection: { grade: 1 } });
    const gradesArr = await gradesCursor.toArray();
    const avgGrade =
      gradesArr.length > 0
        ? gradesArr.reduce((sum, g) => sum + (g.grade || 0), 0) / gradesArr.length
        : null;

    res.json({
      courseId,
      enrollmentCount,
      contentCompletionRate: contentCompletionRate.toFixed(2) + "%",
      submissionRate: submissionRate.toFixed(2) + "%",
      averageGrade: avgGrade ? avgGrade.toFixed(2) : "N/A"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

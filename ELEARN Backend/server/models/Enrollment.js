import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  year_id: { type: mongoose.Schema.Types.ObjectId, ref: "CourseYear", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // optional: who approved/rejected
}, { timestamps: true });

export default mongoose.model("Enrollment", enrollmentSchema);
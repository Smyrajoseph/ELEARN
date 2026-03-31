import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  course_id: { type: String, required: true },
  year_id: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

export const Subject = mongoose.model("Subject", subjectSchema);

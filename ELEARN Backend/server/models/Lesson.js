import mongoose from 'mongoose';
// Lesson
const lessonSchema = new mongoose.Schema({
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  title: String,
  description: String,
  attachment: String
});
export default mongoose.model("Lesson", lessonSchema);


import mongoose from 'mongoose';
// Quiz
const quizSchema = new mongoose.Schema({
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  title: String,
  description: String
});
export default mongoose.model("Quiz", quizSchema);

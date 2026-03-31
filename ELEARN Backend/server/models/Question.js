import mongoose from 'mongoose';
// Question
const questionSchema = new mongoose.Schema({
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  text: String
});
export default mongoose.model("Question", questionSchema);


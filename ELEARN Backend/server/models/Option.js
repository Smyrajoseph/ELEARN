import mongoose from 'mongoose';
// Option
const optionSchema = new mongoose.Schema({
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  text: String,
  isCorrect: Boolean
});
export default mongoose.model("Option", optionSchema);


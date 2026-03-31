import mongoose from 'mongoose';
// Response
const responseSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: [
    {
      question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      option_id: { type: mongoose.Schema.Types.ObjectId, ref: "Option" }
    }
  ],
  score: Number
});

export const Response = mongoose.model("Response", responseSchema);

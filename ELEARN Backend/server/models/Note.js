import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  content: { type: String, default: '' }
}, { timestamps: true });

// Check if model already exists before defining to avoid duplicate register error
export default mongoose.models.Note || mongoose.model('Note', noteSchema);

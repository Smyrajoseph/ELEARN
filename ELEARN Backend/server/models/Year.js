
const courseYearSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  year_number: { type: Number, required: true },
  year_label: { type: String, required: true },}, { timestamps: true });


export default mongoose.model("CourseYear", courseYearSchema);
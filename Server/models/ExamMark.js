import mongoose from "mongoose";

const examMarkSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    className: { type: String, required: true, trim: true },
    sectionName: { type: String, required: true, trim: true },
    examType: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    maximumMarks: { type: Number, required: true, min: 1 },
    obtainedMarks: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

examMarkSchema.index(
  { studentId: 1, examType: 1, subject: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model("ExamMark", examMarkSchema);

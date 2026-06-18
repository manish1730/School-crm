import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    className: { type: String, required: true, trim: true },
    sectionName: { type: String, required: true, trim: true },
    attendanceDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ["Present", "Absent", "Leave"] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

studentAttendanceSchema.index(
  { studentId: 1, attendanceDate: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model("StudentAttendance", studentAttendanceSchema);

import mongoose from "mongoose";

const staffAttendanceSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    attendanceDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ["Present", "Absent", "Leave", "Late"] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

staffAttendanceSchema.index(
  { staffId: 1, attendanceDate: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model("StaffAttendance", staffAttendanceSchema);

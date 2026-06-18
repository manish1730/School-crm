import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    leaveType: { type: String, required: true, trim: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    days: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("LeaveRequest", leaveRequestSchema);

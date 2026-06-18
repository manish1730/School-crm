import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    payrollMonth: { type: String, required: true, trim: true },
    basicSalary: { type: Number, required: true, min: 0 },
    allowance: { type: Number, default: 0, min: 0 },
    deduction: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Paid", "Pending", "Processing"], default: "Pending" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

payrollSchema.index(
  { staffId: 1, payrollMonth: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model("Payroll", payrollSchema);

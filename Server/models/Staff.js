import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, trim: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true, match: [/^\d{10}$/, "Phone must be exactly 10 digits"] },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    erpRole: {
      type: String,
      required: true,
      enum: ["Teacher", "Accountant", "Admin", "Receptionist", "Transport Manager"],
    },
    qualification: { type: String, trim: true, default: "" },
    experience: { type: Number, default: 0, min: 0 },
    address: { type: String, required: true, trim: true },
    bankName: { type: String, trim: true, default: "" },
    accountNumber: { type: String, trim: true, default: "" },
    ifscCode: { type: String, trim: true, uppercase: true, default: "" },
    monthlySalary: { type: Number, default: 0, min: 0 },
    panNumber: { type: String, trim: true, uppercase: true, default: "" },
    documents: {
      aadhaar: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

staffSchema.index({ employeeId: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
staffSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
staffSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.model("Staff", staffSchema);

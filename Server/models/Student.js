import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    bloodGroup: {
      type: String,
      enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: "",
    },
    religion: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{12}$/, "Aadhaar Number must be exactly 12 digits"],
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Phone Number must be exactly 10 digits"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherPhone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Father Phone must be exactly 10 digits"],
    },
    fatherEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    fatherOccupation: {
      type: String,
      trim: true,
      default: "",
    },
    motherName: {
      type: String,
      required: true,
      trim: true,
    },
    motherPhone: {
      type: String,
      trim: true,
      default: "",
    },
    motherOccupation: {
      type: String,
      trim: true,
      default: "",
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    previousSchool: {
      type: String,
      trim: true,
      default: "",
    },
    documents: {
      aadhaar: { type: String, default: "" },
      birthCertificate: { type: String, default: "" },
      studentPhoto: { type: String, default: "" },
      transferCertificate: { type: String, default: "" },
      reportCard: { type: String, default: "" },
      otherDocuments: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Graduated"],
      default: "Active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

studentSchema.index(
  { admissionNumber: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

studentSchema.index(
  { aadhaarNumber: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

studentSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { isActive: true, email: { $gt: "" } },
  }
);

studentSchema.index(
  { className: 1, sectionName: 1, rollNumber: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model("Student", studentSchema);

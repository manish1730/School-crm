import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    studentFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentFee",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },
    feeHead: {
      type: String,
      enum: ["Tuition", "Admission", "Exam", "Transport", "Annual Charges"],
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"],
      required: true,
    },
    transactionReference: {
      type: String,
      trim: true,
      default: "",
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
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

feePaymentSchema.index({ receiptNumber: 1 }, { unique: true });
feePaymentSchema.index(
  { transactionReference: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      transactionReference: { $gt: "" },
      isActive: true,
    },
  }
);
feePaymentSchema.index({ studentId: 1, paymentDate: -1 });
feePaymentSchema.index({ feeHead: 1, paymentDate: -1 });

export default mongoose.model("FeePayment", feePaymentSchema);

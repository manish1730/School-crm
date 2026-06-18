import mongoose from "mongoose";

const amountField = {
  type: Number,
  default: 0,
  min: 0,
};

const discountField = {
  type: Number,
  default: 0,
  min: 0,
  max: 100,
};

const feeStructureSchema = new mongoose.Schema(
  {
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    classSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSection",
      required: true,
    },
    tuitionFee: amountField,
    admissionFee: amountField,
    examFee: amountField,
    transportFee: amountField,
    annualCharges: amountField,
    waivers: {
      staffChildDiscount: discountField,
      scDiscount: discountField,
      stDiscount: discountField,
      obcDiscount: discountField,
      ewsDiscount: discountField,
    },
    dueDate: {
      type: Date,
      default: null,
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
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

feeStructureSchema.index(
  { academicYearId: 1, classSectionId: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

export default mongoose.model("FeeStructure", feeStructureSchema);

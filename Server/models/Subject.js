import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    subjectType: {
      type: String,
      required: true,
      enum: ["Theory", "Practical"],
    },
    applicableClasses: {
      type: [String],
      required: true,
      validate: {
        validator: (classes) => classes.length > 0,
        message: "At least one class must be selected",
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
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

subjectSchema.index(
  { subjectCode: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model("Subject", subjectSchema);

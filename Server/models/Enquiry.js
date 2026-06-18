import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Phone Number must be exactly 10 digits"],
    },
    source: {
      type: String,
      required: true,
      enum: [
        "Walk In",
        "Referral",
        "Website",
        "Social Media",
        "Campaign",
        "Other",
      ],
    },
    counsellor: {
      type: String,
      required: true,
      trim: true,
    },
    enquiryDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "New",
        "Follow Up",
        "Converted",
        "Closed",
      ],
      default: "New",
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

export default mongoose.model("Enquiry", enquirySchema);

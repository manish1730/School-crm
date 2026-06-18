import mongoose from "mongoose";

const schoolProfileSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: [true, "School Name is required"],
      trim: true,
      minlength: [3, "School Name must be at least 3 characters"],
      maxlength: [100, "School Name cannot exceed 100 characters"],
    },
    shortName: {
      type: String,
      required: [true, "Short Name is required"],
      trim: true,
      minlength: [2, "Short Name must be at least 2 characters"],
      maxlength: [20, "Short Name cannot exceed 20 characters"],
      uppercase: true,
    },
    establishedYear: {
      type: Number,
      required: [true, "Established Year is required"],
      min: [1900, "Established Year must be 1900 or later"],
      max: [new Date().getFullYear(), "Established Year cannot be in the future"],
    },
    boardAffiliation: {
      type: String,
      required: [true, "Board Affiliation is required"],
      enum: {
        values: ["CBSE", "ICSE", "PSEB", "State Board", "IB", "Cambridge"],
        message: "Invalid Board Affiliation",
      },
    },
    schoolType: {
      type: String,
      required: [true, "School Type is required"],
      enum: {
        values: ["Government", "Private", "Semi-Government", "International"],
        message: "Invalid School Type",
      },
    },
    email: {
      type: String,
      required: [true, "Official Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email Address"],
    },
    phone: {
      type: String,
      required: [true, "Phone Number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone Number must be exactly 10 digits"],
    },
    alternatePhone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^\d{10}$/.test(v);
        },
        message: "Alternate Phone Number must be exactly 10 digits",
      },
      default: "",
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(v);
        },
        message: "Invalid Website URL",
      },
      default: "",
    },
    addressLine1: {
      type: String,
      required: [true, "Address Line 1 is required"],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      match: [/^[A-Za-z\s]+$/, "City must contain letters only"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      match: [/^[A-Za-z\s]+$/, "State must contain letters only"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Country must contain letters only"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
      match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
    },
    chairman: {
      type: String,
      required: [true, "Chairman Name is required"],
      trim: true,
      minlength: [3, "Chairman Name must be at least 3 characters"],
      maxlength: [100, "Chairman Name cannot exceed 100 characters"],
    },
    principal: {
      type: String,
      required: [true, "Principal Name is required"],
      trim: true,
      minlength: [3, "Principal Name must be at least 3 characters"],
      maxlength: [100, "Principal Name cannot exceed 100 characters"],
    },
    vicePrincipal: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || (v.trim().length >= 3 && v.trim().length <= 100);
        },
        message: "Vice Principal Name must be between 3 and 100 characters",
      },
      default: "",
    },
    adminHead: {
      type: String,
      required: [true, "Admin Head Name is required"],
      trim: true,
      minlength: [3, "Admin Head Name must be at least 3 characters"],
      maxlength: [100, "Admin Head Name cannot exceed 100 characters"],
    },
    logo: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    favicon: {
      type: String,
      default: "",
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Current Academic Year is required"],
    },
    sessionStatus: {
      type: String,
      required: [true, "Session Status is required"],
      enum: {
        values: ["Active", "Inactive"],
        message: "Session Status must be either Active or Inactive",
      },
      default: "Active",
    },
    attendanceEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    feeManagementEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    examEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    transportEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    smsNotificationsEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    emailNotificationsEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add unique indexes for active profiles to satisfy unique constraints safely
schoolProfileSchema.index(
  { schoolName: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

schoolProfileSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

schoolProfileSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model("SchoolProfile", schoolProfileSchema);

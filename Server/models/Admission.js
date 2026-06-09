import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  gender: String,
  phone: String,
  email: String,

  guardianName: String,
  guardianPhone: String,

  className: String,
  section: String,

  documentUrl: String
},
{
  timestamps:true
});

export default mongoose.model(
  "Admission",
  admissionSchema
);
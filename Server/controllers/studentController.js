import Student from "../models/Student.js";
import Category from "../models/Category.js";
import ClassSection from "../models/ClassSection.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateStudent = ({
  firstName,
  lastName,
  dob,
  gender,
  category,
  aadhaarNumber,
  phoneNumber,
  email,
  address,
  fatherName,
  fatherPhone,
  fatherEmail,
  motherName,
  motherPhone,
  className,
  sectionName,
  rollNumber,
  admissionDate,
}) => {
  if (!firstName || firstName.trim().length < 2) return "First Name is required";
  if (!lastName) return "Last Name is required";
  if (!dob) return "DOB is required";
  if (new Date(dob) > new Date()) return "DOB cannot be future date";
  if (!gender) return "Gender is required";
  if (!category) return "Category is required";
  if (!/^\d{12}$/.test(aadhaarNumber || "")) return "Aadhaar Number must be exactly 12 digits";
  if (!/^\d{10}$/.test(phoneNumber || "")) return "Phone Number must be exactly 10 digits";
  if (email && !emailRegex.test(email)) return "Email must be valid";
  if (!address) return "Address is required";
  if (!fatherName) return "Father Name is required";
  if (!/^\d{10}$/.test(fatherPhone || "")) return "Father Phone must be exactly 10 digits";
  if (fatherEmail && !emailRegex.test(fatherEmail)) return "Father Email must be valid";
  if (!motherName) return "Mother Name is required";
  if (motherPhone && !/^\d{10}$/.test(motherPhone)) return "Mother Phone must be exactly 10 digits";
  if (!className) return "Class is required";
  if (!sectionName) return "Section is required";
  if (!rollNumber) return "Roll Number is required";
  if (!admissionDate) return "Admission Date is required";
  if (new Date(admissionDate) > new Date()) return "Admission Date cannot be future date";
  return null;
};

const generateAdmissionNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Student.countDocuments({
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    },
  });

  return `ADM-${year}-${String(count + 1).padStart(4, "0")}`;
};

const validateMasterReferences = async ({ category, className, sectionName }) => {
  const categoryExists = await Category.exists({
    categoryName: category,
    isActive: true,
  });

  if (!categoryExists) {
    return "Category must exist in Master Setup";
  }

  const classSectionExists = await ClassSection.exists({
    className,
    sectionName,
    isActive: true,
  });

  if (!classSectionExists) {
    return "Section must belong to selected class";
  }

  return null;
};

export const getStudents = async (req, res) => {
  try {
    const {
      search = "",
      className,
      sectionName,
      status,
    } = req.query;

    const query = { isActive: true };

    if (className) query.className = className;
    if (sectionName) query.sectionName = sectionName;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { admissionNumber: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { fatherName: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    const validationMessage = validateStudent(req.body);

    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    const masterMessage = await validateMasterReferences(req.body);

    if (masterMessage) {
      return res.status(400).json({ success: false, message: masterMessage });
    }

    const duplicate = await Student.findOne({
      isActive: true,
      $or: [
        { aadhaarNumber: req.body.aadhaarNumber },
        ...(req.body.email ? [{ email: req.body.email }] : []),
        {
          className: req.body.className,
          sectionName: req.body.sectionName,
          rollNumber: req.body.rollNumber,
        },
      ],
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Student already exists with same Aadhaar, email, or roll number",
      });
    }

    const student = await Student.create({
      ...req.body,
      admissionNumber: await generateAdmissionNumber(),
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Student admitted successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to admit student",
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const validationMessage = validateStudent(req.body);

    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    const masterMessage = await validateMasterReferences(req.body);

    if (masterMessage) {
      return res.status(400).json({ success: false, message: masterMessage });
    }

    const duplicate = await Student.findOne({
      _id: { $ne: req.params.id },
      isActive: true,
      $or: [
        { aadhaarNumber: req.body.aadhaarNumber },
        ...(req.body.email ? [{ email: req.body.email }] : []),
        {
          className: req.body.className,
          sectionName: req.body.sectionName,
          rollNumber: req.body.rollNumber,
        },
      ],
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Student already exists with same Aadhaar, email, or roll number",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?.id,
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update student" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updatedBy: req.user?.id,
      },
      { returnDocument: "after" }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete student" });
  }
};

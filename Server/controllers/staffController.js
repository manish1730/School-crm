import Staff from "../models/Staff.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const validateStaff = ({
  fullName,
  email,
  phone,
  dob,
  gender,
  department,
  designation,
  erpRole,
  experience,
  accountNumber,
  ifscCode,
  monthlySalary,
  panNumber,
  address,
}) => {
  if (!fullName) return "Full Name is required";
  if (!emailRegex.test(email || "")) return "Email must be valid";
  if (!/^\d{10}$/.test(phone || "")) return "Phone must be exactly 10 digits";
  if (!dob) return "DOB is required";
  if (!gender) return "Gender is required";
  if (!department) return "Department is required";
  if (!designation) return "Designation is required";
  if (!erpRole) return "ERP Role is required";
  if (experience !== "" && Number.isNaN(Number(experience))) return "Experience must be numeric only";
  if (accountNumber && !/^\d+$/.test(accountNumber)) return "Account Number must be numeric";
  if (ifscCode && !ifscRegex.test(ifscCode)) return "IFSC Code must be valid";
  if (Number(monthlySalary) < 0) return "Monthly Salary must be greater than or equal to 0";
  if (panNumber && !panRegex.test(panNumber)) return "PAN Number must be valid";
  if (!address) return "Address is required";
  return null;
};

const validateMasterReferences = async ({ department, designation }) => {
  const departmentExists = await Department.exists({ departmentName: department, isActive: true });
  if (!departmentExists) return "Department must exist in Master Setup";

  const designationExists = await Designation.exists({ designationName: designation, department, isActive: true });
  if (!designationExists) return "Designation must exist in Master Setup";

  return null;
};

const generateEmployeeId = async () => {
  const year = new Date().getFullYear();
  const count = await Staff.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
  });
  return `EMP-${year}-${String(count + 1).padStart(4, "0")}`;
};

export const getStaff = async (req, res) => {
  try {
    const { search = "", department, designation } = req.query;
    const query = { isActive: true };
    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const staff = await Staff.find(query).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, message: "Staff fetched successfully", count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch staff" });
  }
};

export const createStaff = async (req, res) => {
  try {
    const validationMessage = validateStaff(req.body);
    if (validationMessage) return res.status(400).json({ success: false, message: validationMessage });

    const masterMessage = await validateMasterReferences(req.body);
    if (masterMessage) return res.status(400).json({ success: false, message: masterMessage });

    const duplicate = await Staff.findOne({
      isActive: true,
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (duplicate) return res.status(400).json({ success: false, message: "Staff email or phone already exists" });

    const staff = await Staff.create({
      ...req.body,
      employeeId: await generateEmployeeId(),
      experience: Number(req.body.experience || 0),
      monthlySalary: Number(req.body.monthlySalary || 0),
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });

    res.status(201).json({ success: true, message: "Staff created successfully", data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create staff" });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const validationMessage = validateStaff(req.body);
    if (validationMessage) return res.status(400).json({ success: false, message: validationMessage });

    const masterMessage = await validateMasterReferences(req.body);
    if (masterMessage) return res.status(400).json({ success: false, message: masterMessage });

    const duplicate = await Staff.findOne({
      _id: { $ne: req.params.id },
      isActive: true,
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (duplicate) return res.status(400).json({ success: false, message: "Staff email or phone already exists" });

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        experience: Number(req.body.experience || 0),
        monthlySalary: Number(req.body.monthlySalary || 0),
        updatedBy: req.user?.id,
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({ success: true, message: "Staff updated successfully", data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update staff" });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user?.id },
      { returnDocument: "after" }
    );
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    res.status(200).json({ success: true, message: "Staff deleted successfully", data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete staff" });
  }
};

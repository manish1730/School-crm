import Payroll from "../models/Payroll.js";
import Staff from "../models/Staff.js";

export const getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find({ isActive: true }).populate("staffId").sort({ createdAt: -1 }).lean();
    const stats = {
      totalPayroll: payroll.reduce((sum, item) => sum + item.netSalary, 0),
      paid: payroll.filter((item) => item.status === "Paid").length,
      pending: payroll.filter((item) => item.status === "Pending").length,
      processing: payroll.filter((item) => item.status === "Processing").length,
    };
    res.status(200).json({ success: true, message: "Payroll fetched successfully", data: { payroll, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll" });
  }
};

export const generatePayroll = async (req, res) => {
  try {
    const { staffId, payrollMonth, allowance = 0, deduction = 0, status = "Pending" } = req.body;
    if (!staffId) return res.status(400).json({ success: false, message: "Staff is required" });
    if (!payrollMonth) return res.status(400).json({ success: false, message: "Payroll Month is required" });
    if (Number(allowance) < 0 || Number(deduction) < 0) return res.status(400).json({ success: false, message: "Salary values must be greater than or equal to 0" });

    const exists = await Payroll.findOne({ staffId, payrollMonth, isActive: true });
    if (exists) return res.status(400).json({ success: false, message: "Salary slip generated once per month" });

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const basicSalary = Number(staff.monthlySalary || 0);
    const netSalary = basicSalary + Number(allowance) - Number(deduction);
    const payroll = await Payroll.create({ staffId, payrollMonth, basicSalary, allowance, deduction, netSalary, status, createdBy: req.user?.id, updatedBy: req.user?.id });
    res.status(201).json({ success: true, message: "Payroll generated successfully", data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate payroll" });
  }
};

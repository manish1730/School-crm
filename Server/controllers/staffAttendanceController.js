import Staff from "../models/Staff.js";
import StaffAttendance from "../models/StaffAttendance.js";

export const getStaffAttendance = async (req, res) => {
  try {
    const { date = new Date().toISOString().split("T")[0] } = req.query;
    const day = new Date(date);
    const records = await StaffAttendance.find({ isActive: true, attendanceDate: day }).populate("staffId").lean();
    const staff = await Staff.find({ isActive: true }).lean();
    const stats = {
      totalStaff: staff.length,
      present: records.filter((item) => item.status === "Present").length,
      absent: records.filter((item) => item.status === "Absent").length,
      onLeave: records.filter((item) => item.status === "Leave").length,
    };
    res.status(200).json({ success: true, message: "Staff attendance fetched successfully", data: { records, staff, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch staff attendance" });
  }
};

export const markStaffAttendance = async (req, res) => {
  try {
    const { staffId, attendanceDate, status } = req.body;
    if (!staffId) return res.status(400).json({ success: false, message: "Staff is required" });
    if (!attendanceDate) return res.status(400).json({ success: false, message: "Attendance Date is required" });
    if (!["Present", "Absent", "Leave", "Late"].includes(status)) return res.status(400).json({ success: false, message: "Status is required" });

    const exists = await StaffAttendance.findOne({ staffId, attendanceDate: new Date(attendanceDate), isActive: true });
    if (exists) return res.status(400).json({ success: false, message: "Attendance cannot be marked twice" });

    const record = await StaffAttendance.create({ staffId, attendanceDate, status, createdBy: req.user?.id, updatedBy: req.user?.id });
    res.status(201).json({ success: true, message: "Staff attendance marked successfully", data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark staff attendance" });
  }
};

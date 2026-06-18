import Student from "../models/Student.js";
import StudentAttendance from "../models/StudentAttendance.js";

export const getStudentAttendance = async (req, res) => {
  try {
    const {
      className,
      sectionName,
      date = new Date().toISOString().split("T")[0],
    } = req.query;

    if (!className) return res.status(400).json({ success: false, message: "Class is required" });
    if (!sectionName) return res.status(400).json({ success: false, message: "Section is required" });

    const attendanceDate = new Date(date);
    const students = await Student.find({ isActive: true, className, sectionName }).sort({ rollNumber: 1 }).lean();
    const records = await StudentAttendance.find({ isActive: true, className, sectionName, attendanceDate }).lean();
    const stats = {
      totalStudents: students.length,
      present: records.filter((item) => item.status === "Present").length,
      absent: records.filter((item) => item.status === "Absent").length,
      leave: records.filter((item) => item.status === "Leave").length,
    };

    res.status(200).json({
      success: true,
      message: "Student attendance fetched successfully",
      data: { students, records, stats },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch student attendance" });
  }
};

export const saveStudentAttendance = async (req, res) => {
  try {
    const { className, sectionName, attendanceDate, entries } = req.body;

    if (!className) return res.status(400).json({ success: false, message: "Class is required" });
    if (!sectionName) return res.status(400).json({ success: false, message: "Section is required" });
    if (!attendanceDate) return res.status(400).json({ success: false, message: "Attendance Date is required" });
    if (!Array.isArray(entries) || entries.length === 0) return res.status(400).json({ success: false, message: "Attendance entries are required" });

    for (const entry of entries) {
      if (!["Present", "Absent", "Leave"].includes(entry.status)) {
        return res.status(400).json({ success: false, message: "Invalid attendance status" });
      }
    }

    const day = new Date(attendanceDate);
    const duplicate = await StudentAttendance.findOne({
      attendanceDate: day,
      studentId: { $in: entries.map((entry) => entry.studentId) },
      isActive: true,
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Attendance cannot be duplicated",
      });
    }

    const records = await StudentAttendance.insertMany(
      entries.map((entry) => ({
        studentId: entry.studentId,
        className,
        sectionName,
        attendanceDate: day,
        status: entry.status,
        createdBy: req.user?.id,
        updatedBy: req.user?.id,
      }))
    );

    res.status(201).json({
      success: true,
      message: "Student attendance saved successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save student attendance" });
  }
};

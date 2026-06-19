import Student from "../models/Student.js";
import StudentAttendance from "../models/StudentAttendance.js";
import { logActivity } from "../utils/activityLogger.js";

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
    const records = [];
    for (const entry of entries) {
      const record = await StudentAttendance.findOneAndUpdate(
        {
          studentId: entry.studentId,
          attendanceDate: day,
          isActive: true,
        },
        {
          $set: {
            className,
            sectionName,
            status: entry.status,
            updatedBy: req.user?.id,
          },
          $setOnInsert: {
            createdBy: req.user?.id,
          }
        },
        { upsert: true, new: true }
      );
      records.push(record);
    }

    await logActivity("Attendance Marked", `Attendance marked for class ${className} - ${sectionName} on ${attendanceDate}.`, req);

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save student attendance" });
  }
};

import ExamMark from "../models/ExamMark.js";
import Student from "../models/Student.js";
import ClassSection from "../models/ClassSection.js";
import ExamType from "../models/ExamType.js";
import Subject from "../models/Subject.js";
import { logActivity } from "../utils/activityLogger.js";

const getGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 33) return "E";
  return "F";
};

const validateMasterReferences = async ({ className, sectionName, examType, subject }) => {
  const classExists = await ClassSection.exists({ className, sectionName, isActive: true });
  if (!classExists) return "Class and Section must exist in Master Setup";
  const examExists = await ExamType.exists({ examName: examType, isActive: true });
  if (!examExists) return "Exam Type must exist in Master Setup";
  const subjectExists = await Subject.exists({ subjectName: subject, isActive: true });
  if (!subjectExists) return "Subject must exist in Master Setup";
  return null;
};

export const getMarksEntryStudents = async (req, res) => {
  try {
    const { className, sectionName, examType, subject } = req.query;
    if (!className) return res.status(400).json({ success: false, message: "Class is required" });
    if (!sectionName) return res.status(400).json({ success: false, message: "Section is required" });
    if (!examType) return res.status(400).json({ success: false, message: "Exam Type is required" });
    if (!subject) return res.status(400).json({ success: false, message: "Subject is required" });

    const masterMessage = await validateMasterReferences({ className, sectionName, examType, subject });
    if (masterMessage) return res.status(400).json({ success: false, message: masterMessage });

    const students = await Student.find({ isActive: true, className, sectionName }).sort({ rollNumber: 1 }).lean();
    const marks = await ExamMark.find({ isActive: true, className, sectionName, examType, subject }).lean();

    res.status(200).json({ success: true, message: "Marks entry students fetched successfully", data: { students, marks } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch marks entry students" });
  }
};

export const saveMarks = async (req, res) => {
  try {
    const { className, sectionName, examType, subject, maximumMarks, entries } = req.body;
    if (!className) return res.status(400).json({ success: false, message: "Class is required" });
    if (!sectionName) return res.status(400).json({ success: false, message: "Section is required" });
    if (!examType) return res.status(400).json({ success: false, message: "Exam Type is required" });
    if (!subject) return res.status(400).json({ success: false, message: "Subject is required" });
    if (!maximumMarks || Number(maximumMarks) <= 0) return res.status(400).json({ success: false, message: "Maximum Marks is required" });
    if (!Array.isArray(entries) || entries.length === 0) return res.status(400).json({ success: false, message: "Marks entries are required" });

    const masterMessage = await validateMasterReferences({ className, sectionName, examType, subject });
    if (masterMessage) return res.status(400).json({ success: false, message: masterMessage });

    for (const entry of entries) {
      if (Number(entry.obtainedMarks) < 0 || Number(entry.obtainedMarks) > Number(maximumMarks)) {
        return res.status(400).json({ success: false, message: "Marks cannot exceed maximum marks" });
      }
    }

    const operations = entries.map((entry) => ({
      updateOne: {
        filter: { studentId: entry.studentId, examType, subject, isActive: true },
        update: {
          $set: {
            className,
            sectionName,
            examType,
            subject,
            maximumMarks: Number(maximumMarks),
            obtainedMarks: Number(entry.obtainedMarks),
            updatedBy: req.user?.id,
          },
          $setOnInsert: {
            createdBy: req.user?.id,
          },
        },
        upsert: true,
      },
    }));

    await ExamMark.bulkWrite(operations);

    await logActivity("Exam Result Generated", `Exam marks submitted for ${examType} - ${subject} in class ${className} - ${sectionName}.`, req);

    res.status(200).json({ success: true, message: "Marks saved successfully", data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save marks" });
  }
};

export const getExamResults = async (req, res) => {
  try {
    const { className, sectionName, examType } = req.query;
    const query = { isActive: true };
    if (className) query.className = className;
    if (sectionName) query.sectionName = sectionName;
    if (examType) query.examType = examType;

    const marks = await ExamMark.find(query).populate("studentId").lean();
    const grouped = new Map();

    marks.forEach((mark) => {
      const id = mark.studentId?._id?.toString();
      if (!id) return;
      if (!grouped.has(id)) {
        grouped.set(id, {
          student: mark.studentId,
          maximumMarks: 0,
          obtainedMarks: 0,
          subjects: [],
        });
      }
      const item = grouped.get(id);
      item.maximumMarks += mark.maximumMarks;
      item.obtainedMarks += mark.obtainedMarks;
      item.subjects.push(mark);
    });

    const results = [...grouped.values()].map((item) => {
      const percentage = item.maximumMarks ? Math.round((item.obtainedMarks / item.maximumMarks) * 100) : 0;
      return {
        ...item,
        percentage,
        result: percentage >= 33 ? "Pass" : "Fail",
        grade: getGrade(percentage),
      };
    });

    const passed = results.filter((item) => item.result === "Pass").length;
    const failed = results.filter((item) => item.result === "Fail").length;

    res.status(200).json({
      success: true,
      message: "Exam results fetched successfully",
      data: {
        results,
        stats: {
          totalStudents: results.length,
          passed,
          failed,
          passRate: results.length ? Math.round((passed / results.length) * 100) : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch exam results" });
  }
};

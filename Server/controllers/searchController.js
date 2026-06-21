import Student from "../models/Student.js";
import Staff from "../models/Staff.js";
import ClassSection from "../models/ClassSection.js";
import Department from "../models/Department.js";
import Subject from "../models/Subject.js";
import AcademicYear from "../models/AcademicYear.js";
import FeePayment from "../models/FeePayment.js";
import ExamMark from "../models/ExamMark.js";

export const globalSearch = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const query = q.trim();

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          students: [],
          staff: [],
          classes: [],
          departments: [],
          subjects: [],
          academicYears: [],
          fees: [],
          exams: [],
        },
      });
    }

    const regex = { $regex: query, $options: "i" };

    const [
      students,
      staff,
      classes,
      departments,
      subjects,
      academicYears,
      fees,
      exams,
    ] = await Promise.all([
      Student.find({
        isActive: true,
        $or: [
          { firstName: regex },
          { lastName: regex },
          { admissionNumber: regex },
          { rollNumber: regex },
          { phoneNumber: regex },
        ],
      })
        .limit(5)
        .select("firstName lastName admissionNumber rollNumber className sectionName phoneNumber")
        .lean(),

      Staff.find({
        isActive: true,
        $or: [
          { fullName: regex },
          { employeeId: regex },
          { email: regex },
          { phone: regex },
        ],
      })
        .limit(5)
        .select("fullName employeeId email phone department designation")
        .lean(),

      ClassSection.find({
        isActive: true,
        $or: [
          { className: regex },
          { classCode: regex },
          { sectionName: regex },
        ],
      })
        .limit(5)
        .select("className classCode sectionName classTeacher")
        .lean(),

      Department.find({
        isActive: true,
        $or: [
          { departmentName: regex },
          { departmentCode: regex },
        ],
      })
        .limit(5)
        .select("departmentName departmentCode hodName")
        .lean(),

      Subject.find({
        isActive: true,
        $or: [
          { subjectName: regex },
          { subjectCode: regex },
        ],
      })
        .limit(5)
        .select("subjectName subjectCode subjectType")
        .lean(),

      AcademicYear.find({
        isActive: true,
        name: regex,
      })
        .limit(5)
        .select("name isCurrent startDate endDate")
        .lean(),

      FeePayment.find({
        isActive: true,
        $or: [
          { receiptNumber: regex },
          { transactionReference: regex },
          { feeHead: regex },
        ],
      })
        .populate("studentId", "firstName lastName")
        .limit(5)
        .select("receiptNumber transactionReference feeHead amountPaid paymentMode studentId")
        .lean(),

      ExamMark.find({
        isActive: true,
        $or: [
          { subject: regex },
          { examType: regex },
          { className: regex },
          { sectionName: regex },
        ],
      })
        .populate("studentId", "firstName lastName")
        .limit(5)
        .select("subject examType obtainedMarks maximumMarks className sectionName studentId")
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        students,
        staff,
        classes,
        departments,
        subjects,
        academicYears,
        fees,
        exams,
      },
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during global search",
      error: error.message,
    });
  }
};

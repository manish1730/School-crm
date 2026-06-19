import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import AcademicYear from "../models/AcademicYear.js";
import Category from "../models/Category.js";
import ClassSection from "../models/ClassSection.js";
import FeePayment from "../models/FeePayment.js";
import FeeReceipt from "../models/FeeReceipt.js";
import FeeStructure from "../models/FeeStructure.js";
import Student from "../models/Student.js";
import StudentFee from "../models/StudentFee.js";
import { logActivity } from "../utils/activityLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feeHeads = [
  "Tuition",
  "Admission",
  "Exam",
  "Transport",
  "Annual Charges",
];

const paymentModes = [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
  "Cheque",
];

const numericFields = [
  "tuitionFee",
  "admissionFee",
  "examFee",
  "transportFee",
  "annualCharges",
];

const waiverFields = [
  "staffChildDiscount",
  "scDiscount",
  "stDiscount",
  "obcDiscount",
  "ewsDiscount",
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const asNumber = (value) => Number(value || 0);

const buildRegex = (value) => ({
  $regex: value,
  $options: "i",
});

const getFeeTotal = (structure) =>
  numericFields.reduce((sum, field) => sum + asNumber(structure[field]), 0);

const getWaiverPercent = (student, structure) => {
  const category = (student.category || "").trim().toLowerCase();

  if (category === "sc") return asNumber(structure.waivers?.scDiscount);
  if (category === "st") return asNumber(structure.waivers?.stDiscount);
  if (category === "obc") return asNumber(structure.waivers?.obcDiscount);
  if (category === "ews") return asNumber(structure.waivers?.ewsDiscount);

  return 0;
};

const getStatus = ({ payableAmount, paidAmount, dueDate }) => {
  const remainingAmount = Math.max(payableAmount - paidAmount, 0);

  if (remainingAmount === 0) return "Paid";
  if (dueDate && new Date(dueDate) < new Date()) return "Overdue";
  if (paidAmount > 0) return "Partial";
  return "Pending";
};

const buildStudentFeeValues = (student, structure) => {
  const totalFee = getFeeTotal(structure);
  const discountPercent = getWaiverPercent(student, structure);
  const discountAmount = Math.round((totalFee * discountPercent) / 100);
  const payableAmount = Math.max(totalFee - discountAmount, 0);

  return {
    totalFee,
    discountAmount,
    payableAmount,
    remainingAmount: payableAmount,
    status: getStatus({
      payableAmount,
      paidAmount: 0,
      dueDate: structure.dueDate,
    }),
    dueDate: structure.dueDate,
  };
};

const validateStructurePayload = async (body, excludeId) => {
  const { academicYearId, classSectionId, waivers = {} } = body;

  if (!academicYearId) return "Academic Year is required";
  if (!classSectionId) return "Class Group is required";
  if (!isValidObjectId(academicYearId)) return "Academic Year is invalid";
  if (!isValidObjectId(classSectionId)) return "Class Group is invalid";

  for (const field of numericFields) {
    if (body[field] === "" || body[field] === undefined || body[field] === null) {
      return `${field} is required`;
    }

    if (Number.isNaN(Number(body[field]))) {
      return `${field} must be numeric only`;
    }

    if (Number(body[field]) < 0) {
      return `${field} cannot be negative`;
    }
  }

  for (const field of waiverFields) {
    const value = waivers[field] ?? 0;

    if (Number.isNaN(Number(value))) {
      return `${field} must be numeric only`;
    }

    if (Number(value) < 0 || Number(value) > 100) {
      return `${field} must be between 0 and 100`;
    }
  }

  if (body.dueDate && Number.isNaN(new Date(body.dueDate).getTime())) {
    return "Due Date is invalid";
  }

  const [academicYear, classSection] = await Promise.all([
    AcademicYear.findOne({ _id: academicYearId, isActive: true }).lean(),
    ClassSection.findOne({ _id: classSectionId, isActive: true }).lean(),
  ]);

  if (!academicYear) return "Academic Year must exist in Master Setup";
  if (!classSection) return "Class Group must exist in Master Setup";

  const duplicateQuery = {
    academicYearId,
    classSectionId,
    isActive: true,
  };

  if (excludeId) {
    duplicateQuery._id = { $ne: excludeId };
  }

  const duplicate = await FeeStructure.findOne(duplicateQuery).lean();

  if (duplicate) {
    return "Fee Structure already exists";
  }

  return null;
};

const getStructurePayload = (body, userId) => ({
  academicYearId: body.academicYearId,
  classSectionId: body.classSectionId,
  tuitionFee: Number(body.tuitionFee || 0),
  admissionFee: Number(body.admissionFee || 0),
  examFee: Number(body.examFee || 0),
  transportFee: Number(body.transportFee || 0),
  annualCharges: Number(body.annualCharges || 0),
  dueDate: body.dueDate || null,
  waivers: waiverFields.reduce((waivers, field) => {
    waivers[field] = Number(body.waivers?.[field] || 0);
    return waivers;
  }, {}),
  updatedBy: userId,
});

const populateStructure = (query) =>
  query.populate("academicYearId").populate("classSectionId");

const getStructureQuery = (queryParams = {}) => {
  const query = { isActive: true };

  if (queryParams.academicYearId) query.academicYearId = queryParams.academicYearId;
  if (queryParams.classSectionId) query.classSectionId = queryParams.classSectionId;

  return query;
};

const getPagination = ({ page = 1, limit = 10 }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.max(Number(limit) || 10, 1);

  return {
    page: currentPage,
    limit: pageSize,
    skip: (currentPage - 1) * pageSize,
  };
};

export const getFeeStructures = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const query = getStructureQuery(req.query);

    let structures = await populateStructure(
      FeeStructure.find(query).sort({ createdAt: -1 })
    ).lean();

    if (search) {
      const searchText = search.toLowerCase();
      structures = structures.filter((item) =>
        [
          item.academicYearId?.name,
          item.classSectionId?.className,
          item.classSectionId?.sectionName,
          item.classSectionId?.classCode,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchText))
      );
    }

    const total = structures.length;
    const records = structures.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      message: "Fee Structures fetched successfully",
      count: records.length,
      total,
      data: records,
      pagination: { page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch fee structures",
    });
  }
};

export const getFeeStructureById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Fee Structure ID is invalid" });
    }

    const structure = await populateStructure(
      FeeStructure.findOne({ _id: req.params.id, isActive: true })
    ).lean();

    if (!structure) {
      return res.status(404).json({ success: false, message: "Fee Structure not found" });
    }

    res.status(200).json({
      success: true,
      message: "Fee Structure fetched successfully",
      data: structure,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch fee structure" });
  }
};

export const createFeeStructure = async (req, res) => {
  try {
    const validationMessage = await validateStructurePayload(req.body);

    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    const structure = await FeeStructure.create({
      ...getStructurePayload(req.body, req.user?.id),
      createdBy: req.user?.id,
    });

    const data = await populateStructure(FeeStructure.findById(structure._id)).lean();

    res.status(201).json({
      success: true,
      message: "Fee Structure created successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create fee structure" });
  }
};

export const updateFeeStructure = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Fee Structure ID is invalid" });
    }

    const validationMessage = await validateStructurePayload(req.body, req.params.id);

    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    const structure = await FeeStructure.findByIdAndUpdate(
      req.params.id,
      getStructurePayload(req.body, req.user?.id),
      { returnDocument: "after", runValidators: true }
    );

    if (!structure) {
      return res.status(404).json({ success: false, message: "Fee Structure not found" });
    }

    const data = await populateStructure(FeeStructure.findById(structure._id)).lean();

    res.status(200).json({
      success: true,
      message: "Fee Structure updated successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update fee structure" });
  }
};

export const deleteFeeStructure = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Fee Structure ID is invalid" });
    }

    const structure = await FeeStructure.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updatedBy: req.user?.id,
        deletedBy: req.user?.id,
      },
      { returnDocument: "after" }
    );

    if (!structure) {
      return res.status(404).json({ success: false, message: "Fee Structure not found" });
    }

    res.status(200).json({
      success: true,
      message: "Fee Structure deleted successfully",
      data: structure,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete fee structure" });
  }
};

const getStudentFeeRecord = async ({ student, academicYearId, structure, userId }) => {
  let studentFee = await StudentFee.findOne({
    studentId: student._id,
    academicYearId,
    classSectionId: structure.classSectionId,
    isActive: true,
  });

  const values = buildStudentFeeValues(student, structure);

  if (!studentFee) {
    studentFee = await StudentFee.create({
      studentId: student._id,
      academicYearId,
      classSectionId: structure.classSectionId,
      feeStructureId: structure._id,
      ...values,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  return studentFee;
};

const getStudentClassSection = async (student) =>
  ClassSection.findOne({
    className: student.className,
    sectionName: student.sectionName,
    isActive: true,
  }).lean();

const getApplicableStructure = async ({ student, academicYearId }) => {
  const classSection = await getStudentClassSection(student);

  if (!classSection) return null;

  return FeeStructure.findOne({
    academicYearId,
    classSectionId: classSection._id,
    isActive: true,
  }).lean();
};

const getCurrentAcademicYear = async (academicYearId) => {
  if (academicYearId) {
    if (!isValidObjectId(academicYearId)) return null;
    return AcademicYear.findOne({ _id: academicYearId, isActive: true }).lean();
  }

  const currentYear = await AcademicYear.findOne({
    isActive: true,
    isCurrent: true,
  }).lean();

  if (currentYear) return currentYear;

  return AcademicYear.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
};

const buildPaymentQuery = ({ dateFrom, dateTo, feeHead }) => {
  const query = { isActive: true };

  if (feeHead) query.feeHead = feeHead;
  if (dateFrom || dateTo) {
    query.paymentDate = {};
    if (dateFrom) query.paymentDate.$gte = new Date(dateFrom);
    if (dateTo) query.paymentDate.$lte = new Date(dateTo);
  }

  return query;
};

export const getFeeCollections = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      academicYearId,
      className = "",
      feeHead = "",
      dateFrom = "",
      dateTo = "",
    } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const academicYear = await getCurrentAcademicYear(academicYearId);

    if (!academicYear) {
      return res.status(200).json({
        success: true,
        message: "Fee collections fetched successfully",
        count: 0,
        total: 0,
        data: { collections: [], stats: { totalStudents: 0, totalCollected: 0, pendingAmount: 0, overduePayments: 0 } },
      });
    }

    const studentQuery = { isActive: true };
    if (className) studentQuery.className = className;
    if (search) {
      studentQuery.$or = [
        { firstName: buildRegex(search) },
        { lastName: buildRegex(search) },
        { admissionNumber: buildRegex(search) },
        { phoneNumber: buildRegex(search) },
      ];
    }

    const students = await Student.find(studentQuery).sort({ createdAt: -1 }).lean();
    const classSections = await ClassSection.find({ isActive: true }).lean();
    const classSectionMap = new Map(
      classSections.map((item) => [`${item.className}-${item.sectionName}`, item])
    );
    const structures = await FeeStructure.find({
      academicYearId: academicYear._id,
      isActive: true,
    }).lean();
    const structureMap = new Map(
      structures.map((item) => [String(item.classSectionId), item])
    );
    const studentFees = await StudentFee.find({
      academicYearId: academicYear._id,
      isActive: true,
    }).lean();
    const studentFeeMap = new Map(
      studentFees.map((item) => [String(item.studentId), item])
    );

    const payments = await FeePayment.find({
      ...buildPaymentQuery({ dateFrom, dateTo, feeHead }),
      academicYearId: academicYear._id,
    }).lean();
    const paymentStudentSet = new Set(payments.map((item) => String(item.studentId)));

    let collections = students
      .map((student) => {
        const classSection = classSectionMap.get(`${student.className}-${student.sectionName}`);
        const structure = classSection ? structureMap.get(String(classSection._id)) : null;

        if (!classSection || !structure) return null;

        const computed = buildStudentFeeValues(student, structure);
        const stored = studentFeeMap.get(String(student._id));
        const paidAmount = asNumber(stored?.paidAmount);
        const payableAmount = asNumber(stored?.payableAmount || computed.payableAmount);
        const remainingAmount = Math.max(payableAmount - paidAmount, 0);
        const computedStatus = getStatus({
          payableAmount,
          paidAmount,
          dueDate: stored?.dueDate || structure.dueDate,
        });

        return {
          _id: stored?._id || `${student._id}-${structure._id}`,
          studentFeeId: stored?._id || "",
          student,
          academicYear,
          classSection,
          feeStructure: structure,
          totalFee: payableAmount,
          paidAmount,
          remainingAmount,
          status: stored?.status === "Paid" ? "Paid" : computedStatus,
          lastPaymentDate: stored?.updatedAt || null,
        };
      })
      .filter(Boolean);

    if (status) collections = collections.filter((item) => item.status === status);
    if (feeHead || dateFrom || dateTo) {
      collections = collections.filter((item) => paymentStudentSet.has(String(item.student._id)));
    }

    const stats = {
      totalStudents: collections.length,
      totalCollected: collections.reduce((sum, item) => sum + item.paidAmount, 0),
      pendingAmount: collections.reduce((sum, item) => sum + item.remainingAmount, 0),
      overduePayments: collections.filter((item) => item.status === "Overdue").length,
    };
    const total = collections.length;
    const paginated = collections.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      message: "Fee collections fetched successfully",
      count: paginated.length,
      total,
      data: {
        collections: paginated,
        stats,
      },
      pagination: { page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch fee collections" });
  }
};

export const getStudentFeeSummary = async (req, res) => {
  try {
    const { academicYearId } = req.query;

    if (!isValidObjectId(req.params.studentId)) {
      return res.status(400).json({ success: false, message: "Student ID is invalid" });
    }

    const [student, academicYear] = await Promise.all([
      Student.findOne({ _id: req.params.studentId, isActive: true }).lean(),
      getCurrentAcademicYear(academicYearId),
    ]);

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    if (!academicYear) return res.status(404).json({ success: false, message: "Academic Year not found" });

    const structure = await getApplicableStructure({
      student,
      academicYearId: academicYear._id,
    });

    if (!structure) {
      return res.status(404).json({
        success: false,
        message: "Fee Structure not found for selected student",
      });
    }

    const classSection = await ClassSection.findById(structure.classSectionId).lean();
    const computed = buildStudentFeeValues(student, structure);
    const stored = await StudentFee.findOne({
      studentId: student._id,
      academicYearId: academicYear._id,
      classSectionId: structure.classSectionId,
      isActive: true,
    }).lean();
    const payments = await FeePayment.find({
      studentId: student._id,
      academicYearId: academicYear._id,
      isActive: true,
    }).sort({ paymentDate: -1 }).lean();

    const paidAmount = asNumber(stored?.paidAmount);
    const payableAmount = asNumber(stored?.payableAmount || computed.payableAmount);
    const remainingAmount = Math.max(payableAmount - paidAmount, 0);

    res.status(200).json({
      success: true,
      message: "Student fee summary fetched successfully",
      data: {
        student,
        academicYear,
        classSection,
        feeStructure: structure,
        studentFee: stored,
        payments,
        totalFee: payableAmount,
        paidAmount,
        remainingAmount,
        status: getStatus({
          payableAmount,
          paidAmount,
          dueDate: stored?.dueDate || structure.dueDate,
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch student fee summary" });
  }
};

const validatePaymentPayload = async (body) => {
  const {
    studentId,
    academicYearId,
    feeHead,
    paymentDate,
    amountPaid,
    paymentMode,
    transactionReference = "",
    remarks = "",
  } = body;

  if (!studentId) return "Please select a student.";
  if (!academicYearId) return "Academic Year is required";
  if (!isValidObjectId(studentId)) return "Student ID is invalid";
  if (!isValidObjectId(academicYearId)) return "Academic Year is invalid";
  if (!feeHead) return "Fee Head is required";
  if (!feeHeads.includes(feeHead)) return "Fee Head is invalid";
  if (amountPaid === "" || amountPaid === undefined || amountPaid === null) {
    return "Payment amount is required.";
  }
  if (Number.isNaN(Number(amountPaid))) return "Payment amount must be numeric only";
  if (Number(amountPaid) <= 0) return "Payment amount must be greater than 0";
  if (!paymentDate) return "Payment Date is required";
  if (new Date(paymentDate) > new Date()) return "Payment Date cannot be future date";
  if (!paymentMode) return "Payment Mode is required";
  if (!paymentModes.includes(paymentMode)) return "Payment Mode is invalid";
  if (paymentMode !== "Cash" && !transactionReference.trim()) {
    return "Transaction Reference is required";
  }
  if (remarks.length > 500) return "Remarks cannot exceed 500 characters";

  return null;
};

const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const count = await FeeReceipt.countDocuments({
      receiptNumber: { $regex: `^RCPT-${year}-` },
    });
    const receiptNumber = `RCPT-${year}-${String(count + attempt + 1).padStart(5, "0")}`;
    const exists = await FeeReceipt.exists({ receiptNumber });

    if (!exists) return receiptNumber;
  }

  return `RCPT-${year}-${Date.now()}`;
};

export const recordFeePayment = async (req, res) => {
  try {
    const validationMessage = await validatePaymentPayload(req.body);

    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    const {
      studentId,
      academicYearId,
      feeHead,
      paymentDate,
      paymentMode,
      transactionReference = "",
      remarks = "",
    } = req.body;
    const amountPaid = Number(req.body.amountPaid);

    const [student, academicYear] = await Promise.all([
      Student.findOne({ _id: studentId, isActive: true }),
      AcademicYear.findOne({ _id: academicYearId, isActive: true }),
    ]);

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    if (!academicYear) return res.status(404).json({ success: false, message: "Academic Year not found" });

    const structure = await getApplicableStructure({ student, academicYearId });
    if (!structure) {
      return res.status(404).json({
        success: false,
        message: "Fee Structure not found for selected student",
      });
    }

    if (transactionReference.trim()) {
      const duplicateReference = await FeePayment.findOne({
        transactionReference: transactionReference.trim(),
        isActive: true,
      }).lean();

      if (duplicateReference) {
        return res.status(400).json({
          success: false,
          message: "Transaction Reference already exists",
        });
      }
    }

    const studentFee = await getStudentFeeRecord({
      student,
      academicYearId,
      structure,
      userId: req.user?.id,
    });

    if (amountPaid > studentFee.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: "Amount exceeds remaining balance.",
      });
    }

    const duplicatePayment = await FeePayment.findOne({
      studentFeeId: studentFee._id,
      feeHead,
      paymentDate: new Date(paymentDate),
      amountPaid,
      paymentMode,
      isActive: true,
    }).lean();

    if (duplicatePayment) {
      return res.status(400).json({
        success: false,
        message: "Duplicate payment submission detected",
      });
    }

    const receiptNumber = await generateReceiptNumber();
    const payment = await FeePayment.create({
      studentFeeId: studentFee._id,
      studentId,
      academicYearId,
      feeStructureId: structure._id,
      feeHead,
      paymentDate,
      amountPaid,
      paymentMode,
      transactionReference: transactionReference.trim(),
      remarks,
      receiptNumber,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });

    const paidAmount = studentFee.paidAmount + amountPaid;
    const remainingAmount = Math.max(studentFee.payableAmount - paidAmount, 0);
    const status = getStatus({
      payableAmount: studentFee.payableAmount,
      paidAmount,
      dueDate: studentFee.dueDate,
    });

    await StudentFee.findByIdAndUpdate(studentFee._id, {
      paidAmount,
      remainingAmount,
      status,
      updatedBy: req.user?.id,
    });

    const receipt = await FeeReceipt.create({
      receiptNumber,
      paymentId: payment._id,
      studentId,
      studentFeeId: studentFee._id,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });

    await logActivity("Fee Collected", `Fee payment of ₹${payment.amountPaid} received for student (Receipt: ${payment.receiptNumber}).`, req);

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        payment,
        receipt,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Receipt Number or Transaction Reference already exists",
      });
    }

    res.status(500).json({ success: false, message: "Failed to record payment" });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Payment ID is invalid" });
    }

    const payment = await FeePayment.findOne({ _id: req.params.id, isActive: true })
      .populate("studentId")
      .populate("academicYearId")
      .populate("studentFeeId")
      .lean();

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payment" });
  }
};

const getReceiptData = async (id) => {
  if (!isValidObjectId(id)) return null;

  return FeeReceipt.findOne({ _id: id, isActive: true })
    .populate({
      path: "paymentId",
      populate: [
        { path: "academicYearId" },
        { path: "studentFeeId" },
      ],
    })
    .populate("studentId")
    .lean();
};

export const getReceiptById = async (req, res) => {
  try {
    const receipt = await getReceiptData(req.params.id);

    if (!receipt) return res.status(404).json({ success: false, message: "Receipt not found" });

    res.status(200).json({
      success: true,
      message: "Receipt fetched successfully",
      data: receipt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch receipt" });
  }
};

const writeReceiptPdf = async ({ res, receipt }) => {
  const PDFDocument = (await import("pdfkit")).default;
  const doc = new PDFDocument({ margin: 48 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${receipt.receiptNumber}.pdf`
  );

  doc.pipe(res);

  const logoPath = path.resolve(__dirname, "../../Frontend/src/assets/logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 48, 40, { width: 54 });
  }

  const payment = receipt.paymentId;
  const student = receipt.studentId;
  const studentFee = payment.studentFeeId;

  doc
    .fontSize(20)
    .text("DEE Campus", 120, 45)
    .fontSize(10)
    .text("Fee Receipt", 120, 72)
    .moveDown(3);

  doc.fontSize(14).text(`Receipt Number: ${receipt.receiptNumber}`);
  doc.fontSize(11).text(`Payment Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
  doc.text(`Student Name: ${student.firstName} ${student.lastName}`);
  doc.text(`Admission Number: ${student.admissionNumber}`);
  doc.text(`Class / Section: ${student.className} / ${student.sectionName}`);
  doc.text(`Fee Head: ${payment.feeHead}`);
  doc.text(`Amount Paid: ${payment.amountPaid}`);
  doc.text(`Remaining Amount: ${studentFee.remainingAmount}`);
  doc.text(`Payment Mode: ${payment.paymentMode}`);
  doc.text(`Transaction Reference: ${payment.transactionReference || "-"}`);
  doc.moveDown(2).fontSize(10).text("This is a system generated receipt.");
  doc.end();
};

export const downloadReceipt = async (req, res) => {
  try {
    const receipt = await getReceiptData(req.params.id);

    if (!receipt) return res.status(404).json({ success: false, message: "Receipt not found" });

    await writeReceiptPdf({ res, receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to download receipt" });
  }
};

const getCollectionExportRows = async (query) => {
  const response = {
    query: {
      ...query,
      page: 1,
      limit: 100000,
    },
  };
  let rows = [];
  let stats = {};
  const fakeRes = {
    status: () => ({
      json: (payload) => {
        rows = payload.data?.collections || [];
        stats = payload.data?.stats || {};
      },
    }),
  };

  await getFeeCollections(response, fakeRes);
  return { rows, stats };
};

const getStructureExportRows = async (query) => {
  const structures = await populateStructure(
    FeeStructure.find(getStructureQuery(query)).sort({ createdAt: -1 })
  ).lean();

  return structures;
};

const writePdfTable = async ({ res, title, headers, rows, filename }) => {
  const PDFDocument = (await import("pdfkit")).default;
  const doc = new PDFDocument({ margin: 36, size: "A4", layout: "landscape" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.pdf`);
  doc.pipe(res);
  doc.fontSize(16).text(title);
  doc.moveDown();
  doc.fontSize(8).text(headers.join(" | "));
  doc.moveDown();
  rows.forEach((row) => {
    doc.text(row.join(" | "));
  });
  doc.end();
};

const writeExcel = async ({ res, filename, worksheetName, columns, rows }) => {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(worksheetName);

  worksheet.columns = columns;
  rows.forEach((row) => worksheet.addRow(row));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};

export const exportCollectionsPdf = async (req, res) => {
  try {
    const { rows } = await getCollectionExportRows(req.query);
    await writePdfTable({
      res,
      title: "Fee Collection Report",
      filename: "fee-collection-report",
      headers: ["Student", "Admission", "Class", "Paid", "Remaining", "Status"],
      rows: rows.map((item) => [
        `${item.student.firstName} ${item.student.lastName}`,
        item.student.admissionNumber,
        `${item.student.className}-${item.student.sectionName}`,
        item.paidAmount,
        item.remainingAmount,
        item.status,
      ]),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to export fee collection PDF" });
  }
};

export const exportCollectionsExcel = async (req, res) => {
  try {
    const { rows } = await getCollectionExportRows(req.query);
    await writeExcel({
      res,
      filename: "fee-collection-report",
      worksheetName: "Fee Collection",
      columns: [
        { header: "Student Name", key: "studentName", width: 24 },
        { header: "Admission Number", key: "admissionNumber", width: 18 },
        { header: "Class", key: "className", width: 16 },
        { header: "Paid Amount", key: "paidAmount", width: 14 },
        { header: "Remaining Amount", key: "remainingAmount", width: 18 },
        { header: "Status", key: "status", width: 14 },
      ],
      rows: rows.map((item) => ({
        studentName: `${item.student.firstName} ${item.student.lastName}`,
        admissionNumber: item.student.admissionNumber,
        className: `${item.student.className}-${item.student.sectionName}`,
        paidAmount: item.paidAmount,
        remainingAmount: item.remainingAmount,
        status: item.status,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to export fee collection Excel" });
  }
};

export const exportStructuresPdf = async (req, res) => {
  try {
    const rows = await getStructureExportRows(req.query);
    await writePdfTable({
      res,
      title: "Fee Structure Report",
      filename: "fee-structure-report",
      headers: ["Academic Year", "Class", "Tuition", "Admission", "Exam", "Transport", "Annual"],
      rows: rows.map((item) => [
        item.academicYearId?.name,
        `${item.classSectionId?.className}-${item.classSectionId?.sectionName}`,
        item.tuitionFee,
        item.admissionFee,
        item.examFee,
        item.transportFee,
        item.annualCharges,
      ]),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to export fee structure PDF" });
  }
};

export const exportStructuresExcel = async (req, res) => {
  try {
    const rows = await getStructureExportRows(req.query);
    await writeExcel({
      res,
      filename: "fee-structure-report",
      worksheetName: "Fee Structures",
      columns: [
        { header: "Academic Year", key: "academicYear", width: 20 },
        { header: "Class Group", key: "classGroup", width: 18 },
        { header: "Tuition Fee", key: "tuitionFee", width: 14 },
        { header: "Admission Fee", key: "admissionFee", width: 16 },
        { header: "Exam Fee", key: "examFee", width: 14 },
        { header: "Transport Fee", key: "transportFee", width: 16 },
        { header: "Annual Charges", key: "annualCharges", width: 18 },
      ],
      rows: rows.map((item) => ({
        academicYear: item.academicYearId?.name,
        classGroup: `${item.classSectionId?.className}-${item.classSectionId?.sectionName}`,
        tuitionFee: item.tuitionFee,
        admissionFee: item.admissionFee,
        examFee: item.examFee,
        transportFee: item.transportFee,
        annualCharges: item.annualCharges,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to export fee structure Excel" });
  }
};

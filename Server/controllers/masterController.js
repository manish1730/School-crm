import AcademicYear from "../models/AcademicYear.js";
import ClassSection from "../models/ClassSection.js";
import Subject from "../models/Subject.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import Category from "../models/Category.js";
import ExamType from "../models/ExamType.js";

export const getAllMasterData = async (req, res) => {
  try {
    const [
      academicYears,
      classSections,
      subjects,
      departments,
      designations,
      categories,
      examTypes,
    ] = await Promise.all([
      AcademicYear.find({ isActive: true }).select('-createdAt -updatedBy -createdBy -deletedBy -__v'),
      ClassSection.find({ isActive: true }).select('-createdAt -updatedBy -createdBy -deletedBy -__v'),
      Subject.find({ isActive: true }).select('-createdAt -updatedBy -createdBy -deletedBy -__v'),
      Department.find({ isActive: true }).select('-createdAt -updatedBy -createdBy -deletedBy -__v'),
      Designation.find({ isActive: true }).select('-createdAt -updatedBy -createdBy -deletedBy -__v'),
      Category.find({ isActive: true }).select('-createdAt -updatedBy -createdBy -deletedBy -__v'),
      ExamType.find({ isActive: true }).select('-createdAt -updatedBy -createdBy -deletedBy -__v'),
    ]);

    // Format classes and sections from classSections
    // Assuming ClassSection has 'className' and 'sectionName'
    const classesMap = new Map();
    const sectionsSet = new Set();
    const sections = [];

    classSections.forEach(cs => {
      if (cs.className) {
        if (!classesMap.has(cs.className)) {
          classesMap.set(cs.className, {
            _id: cs._id,
            className: cs.className,
            sections: []
          });
        }
        if (cs.sectionName) {
           classesMap.get(cs.className).sections.push({
             _id: cs._id,
             sectionName: cs.sectionName
           });
           if (!sectionsSet.has(cs.sectionName)) {
             sectionsSet.add(cs.sectionName);
             sections.push({ sectionName: cs.sectionName });
           }
        }
      }
    });

    const classes = Array.from(classesMap.values());

    const feeTypes = [
      { id: 'tuitionFee', name: 'Tuition Fee' },
      { id: 'admissionFee', name: 'Admission Fee' },
      { id: 'examFee', name: 'Exam Fee' },
      { id: 'transportFee', name: 'Transport Fee' },
      { id: 'annualCharges', name: 'Annual Charges' },
    ];

    res.status(200).json({
      academicYears,
      classSections,
      classes,
      sections,
      subjects,
      departments,
      designations,
      categories,
      examTypes,
      feeTypes,
    });
  } catch (error) {
    console.error("Error fetching master data:", error);
    res.status(500).json({ message: "Error fetching master data" });
  }
};

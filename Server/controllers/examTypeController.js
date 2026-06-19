import ExamType from "../models/ExamType.js";
import { createMasterCrudController } from "./masterCrudController.js";

const controller = createMasterCrudController({
  Model: ExamType,
  moduleName: "Exam Type",
  searchFields: ["examName", "examCode", "description"],
  duplicateChecks: [
    { field: "examName", label: "Exam Name" },
    { field: "examCode", label: "Exam Code" },
  ],
  validate: ({ examName, examCode, weightage }) => {
    if (!examName) return "Exam Name is required";
    if (!examCode) return "Exam Code is required";
    if (weightage === "" || weightage === undefined || weightage === null) {
      return "Weightage is required";
    }
    if (Number.isNaN(Number(weightage))) {
      return "Weightage must be numeric only";
    }
    if (Number(weightage) < 0 || Number(weightage) > 100) {
      return "Weightage must be between 0 and 100";
    }
    return null;
  },
});

export const getExamTypes = controller.getAll;

export const createExamType = async (req, res) => {
  try {
    const newWeightage = Number(req.body.weightage || 0);

    // Calculate total weightage of all currently active exams
    const activeExams = await ExamType.find({ isActive: true }).lean();
    const currentTotalWeightage = activeExams.reduce((sum, exam) => sum + (exam.weightage || 0), 0);

    if (currentTotalWeightage + newWeightage > 100) {
      return res.status(400).json({
        success: false,
        message: "Total exam weightage cannot exceed 100%",
      });
    }

    return controller.create(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateExamType = async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve the exam being updated
    const currentExam = await ExamType.findById(id).lean();
    if (!currentExam) {
      return res.status(404).json({
        success: false,
        message: "Exam Type not found",
      });
    }

    const willBeActive = req.body.isActive !== undefined ? req.body.isActive : currentExam.isActive;
    const newWeightage = req.body.weightage !== undefined ? Number(req.body.weightage) : currentExam.weightage;

    if (willBeActive) {
      // Calculate total weightage of OTHER active exams
      const otherActiveExams = await ExamType.find({ _id: { $ne: id }, isActive: true }).lean();
      const otherTotalWeightage = otherActiveExams.reduce((sum, exam) => sum + (exam.weightage || 0), 0);

      if (otherTotalWeightage + newWeightage > 100) {
        return res.status(400).json({
          success: false,
          message: "Total exam weightage cannot exceed 100%",
        });
      }
    }

    return controller.update(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteExamType = controller.remove;

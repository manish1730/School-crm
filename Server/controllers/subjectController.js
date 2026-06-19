import Subject from "../models/Subject.js";
import { createMasterCrudController } from "./masterCrudController.js";

const controller = createMasterCrudController({
  Model: Subject,
  moduleName: "Subject",
  searchFields: [
    "subjectName",
    "subjectCode",
    "subjectType",
    "description",
  ],
  duplicateChecks: [
    { field: "subjectCode", label: "Subject Code" },
  ],
  validate: ({
    subjectName,
    subjectCode,
    subjectType,
    applicableClasses,
  }) => {
    if (!subjectName) return "Subject Name is required";
    if (!subjectCode) return "Subject Code is required";
    if (!subjectType) return "Subject Type is required";
    if (!["Theory", "Practical"].includes(subjectType)) {
      return "Subject Type must be Theory or Practical";
    }
    if (!Array.isArray(applicableClasses) || applicableClasses.length === 0) {
      return "At least one class must be selected";
    }
    return null;
  },
});

export const getSubjects = controller.getAll;
export const createSubject = controller.create;
export const updateSubject = controller.update;
export const deleteSubject = controller.remove;

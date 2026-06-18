import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getExamResults,
  getMarksEntryStudents,
  saveMarks,
} from "../controllers/examController.js";

const router = express.Router();

router.get("/marks-entry", authMiddleware, getMarksEntryStudents);
router.post("/marks-entry/save", authMiddleware, saveMarks);
router.get("/results", authMiddleware, getExamResults);

export default router;

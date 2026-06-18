import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getStudentAttendance,
  saveStudentAttendance,
} from "../controllers/studentAttendanceController.js";

const router = express.Router();

router.get("/", authMiddleware, getStudentAttendance);
router.post("/save", authMiddleware, saveStudentAttendance);

export default router;

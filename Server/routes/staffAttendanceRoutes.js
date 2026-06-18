import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getStaffAttendance, markStaffAttendance } from "../controllers/staffAttendanceController.js";

const router = express.Router();

router.get("/", authMiddleware, getStaffAttendance);
router.post("/mark", authMiddleware, markStaffAttendance);

export default router;

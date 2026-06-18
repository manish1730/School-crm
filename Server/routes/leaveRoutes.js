import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createLeaveRequest, getLeaveRequests, updateLeaveStatus } from "../controllers/leaveController.js";

const router = express.Router();

router.get("/", authMiddleware, getLeaveRequests);
router.post("/create", authMiddleware, createLeaveRequest);
router.patch("/:id/status", authMiddleware, updateLeaveStatus);

export default router;

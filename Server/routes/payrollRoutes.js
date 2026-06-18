import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generatePayroll, getPayroll } from "../controllers/payrollController.js";

const router = express.Router();

router.get("/", authMiddleware, getPayroll);
router.post("/generate", authMiddleware, generatePayroll);

export default router;

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createStaff, deleteStaff, getStaff, updateStaff } from "../controllers/staffController.js";

const router = express.Router();

router.get("/", authMiddleware, getStaff);
router.post("/create", authMiddleware, createStaff);
router.put("/:id", authMiddleware, updateStaff);
router.delete("/:id", authMiddleware, deleteStaff);

export default router;

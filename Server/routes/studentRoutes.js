import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createStudent,
  deleteStudent,
  getStudents,
  promoteStudents,
  updateStudent,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", authMiddleware, getStudents);
router.post("/create", authMiddleware, createStudent);
router.post("/promote", authMiddleware, promoteStudents);
router.put("/:id", authMiddleware, updateStudent);
router.delete("/:id", authMiddleware, deleteStudent);

export default router;

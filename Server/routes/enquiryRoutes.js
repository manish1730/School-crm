import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  convertEnquiry,
  createEnquiry,
  deleteEnquiry,
  getEnquiries,
  getEnquiryStats,
  updateEnquiry,
} from "../controllers/enquiryController.js";

const router = express.Router();

router.get("/", authMiddleware, getEnquiries);
router.get("/stats", authMiddleware, getEnquiryStats);
router.post("/create", authMiddleware, createEnquiry);
router.put("/:id", authMiddleware, updateEnquiry);
router.patch("/:id/convert", authMiddleware, convertEnquiry);
router.delete("/:id", authMiddleware, deleteEnquiry);

export default router;

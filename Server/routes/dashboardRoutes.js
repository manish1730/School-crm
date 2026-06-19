import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getCardsAnalytics,
  getAttendanceTrend,
  getEnquiryFunnel,
  getCollectionTrend,
  getRecentActivities,
  getTodayBirthdays,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/cards", authMiddleware, getCardsAnalytics);
router.get("/attendance-trend", authMiddleware, getAttendanceTrend);
router.get("/enquiry-funnel", authMiddleware, getEnquiryFunnel);
router.get("/collection-trend", authMiddleware, getCollectionTrend);
router.get("/recent-activities", authMiddleware, getRecentActivities);
router.get("/birthdays", authMiddleware, getTodayBirthdays);

export default router;

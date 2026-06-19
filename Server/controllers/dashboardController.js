import * as dashboardService from "../services/dashboardService.js";

export const getCardsAnalytics = async (req, res) => {
  try {
    const data = await dashboardService.getCardsAnalytics();
    res.status(200).json({
      success: true,
      message: "Cards analytics fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch card statistics",
    });
  }
};

export const getAttendanceTrend = async (req, res) => {
  try {
    const data = await dashboardService.getAttendanceTrend();
    res.status(200).json({
      success: true,
      message: "Attendance trend fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendance trend",
    });
  }
};

export const getEnquiryFunnel = async (req, res) => {
  try {
    const data = await dashboardService.getEnquiryFunnel();
    res.status(200).json({
      success: true,
      message: "Enquiry funnel fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch enquiry funnel",
    });
  }
};

export const getCollectionTrend = async (req, res) => {
  try {
    const data = await dashboardService.getCollectionTrend();
    res.status(200).json({
      success: true,
      message: "Collection trend fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch collection trend",
    });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const data = await dashboardService.getRecentActivities();
    res.status(200).json({
      success: true,
      message: "Recent activities fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch recent activities",
    });
  }
};

export const getTodayBirthdays = async (req, res) => {
  try {
    const data = await dashboardService.getTodayBirthdays();
    res.status(200).json({
      success: true,
      message: "Today's birthdays fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch today's birthdays",
    });
  }
};

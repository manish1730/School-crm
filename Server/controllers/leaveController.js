import LeaveRequest from "../models/LeaveRequest.js";
import { logActivity } from "../utils/activityLogger.js";

export const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ isActive: true }).populate("staffId").sort({ createdAt: -1 }).lean();
    const stats = {
      total: leaves.length,
      approved: leaves.filter((item) => item.status === "Approved").length,
      pending: leaves.filter((item) => item.status === "Pending").length,
      rejected: leaves.filter((item) => item.status === "Rejected").length,
    };
    res.status(200).json({ success: true, message: "Leave requests fetched successfully", data: { leaves, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch leave requests" });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const { staffId, leaveType, fromDate, toDate, reason } = req.body;
    if (!staffId) return res.status(400).json({ success: false, message: "Staff is required" });
    if (!leaveType) return res.status(400).json({ success: false, message: "Leave Type is required" });
    if (!fromDate || !toDate) return res.status(400).json({ success: false, message: "From Date and To Date are required" });
    if (new Date(fromDate) > new Date(toDate)) return res.status(400).json({ success: false, message: "From date must be before To date" });
    if (!reason) return res.status(400).json({ success: false, message: "Reason is required" });

    const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / 86400000) + 1;
    const leave = await LeaveRequest.create({ ...req.body, days, createdBy: req.user?.id, updatedBy: req.user?.id });
    res.status(201).json({ success: true, message: "Leave request created successfully", data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create leave request" });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) return res.status(400).json({ success: false, message: "Invalid leave status" });
    const current = await LeaveRequest.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "Leave request not found" });
    if (current.status === "Rejected" && status === "Approved") return res.status(400).json({ success: false, message: "Rejected leave cannot be approved later" });
    current.status = status;
    current.updatedBy = req.user?.id;
    await current.save();

    if (status === "Approved") {
      await logActivity("Leave Approved", `Leave request of type ${current.leaveType} for ${current.days} day(s) was approved.`, req);
    }

    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully`, data: current });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update leave status" });
  }
};

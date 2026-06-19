import Student from "../models/Student.js";
import Staff from "../models/Staff.js";
import StudentAttendance from "../models/StudentAttendance.js";
import FeePayment from "../models/FeePayment.js";
import StudentFee from "../models/StudentFee.js";
import AcademicCalendar from "../models/AcademicCalendar.js";
import Enquiry from "../models/Enquiry.js";
import ActivityLog from "../models/ActivityLog.js";

/**
 * Get card statistics.
 */
export const getCardsAnalytics = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Run card queries in parallel
  const [
    totalStudents,
    totalStaff,
    attendanceToday,
    feeTodayRes,
    feeMonthRes,
    pendingDuesRes,
    upcomingEvents,
  ] = await Promise.all([
    // 1. Total Students
    Student.countDocuments({ isActive: true }),

    // 2. Total Staff
    Staff.countDocuments({ isActive: true }),

    // 3. Today's Attendance stats
    StudentAttendance.aggregate([
      {
        $match: {
          attendanceDate: { $gte: startOfToday, $lte: endOfToday },
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          present: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]),

    // 4. Fee Collection Today
    FeePayment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfToday, $lte: endOfToday },
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amountPaid" },
        },
      },
    ]),

    // 5. Monthly Collection
    FeePayment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfMonth },
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amountPaid" },
        },
      },
    ]),

    // 6. Pending Dues
    StudentFee.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$remainingAmount" },
        },
      },
    ]),

    // 7. Upcoming Events
    AcademicCalendar.countDocuments({
      startDate: { $gte: startOfToday },
      isActive: true,
    }),
  ]);

  // Format attendance
  let attendancePct = 0;
  if (attendanceToday.length > 0 && attendanceToday[0].total > 0) {
    attendancePct = Number(
      ((attendanceToday[0].present / attendanceToday[0].total) * 100).toFixed(1)
    );
  }

  return {
    totalStudents,
    totalStaff,
    todayAttendance: attendancePct,
    feeToday: feeTodayRes[0]?.total || 0,
    feeMonth: feeMonthRes[0]?.total || 0,
    pendingDues: pendingDuesRes[0]?.total || 0,
    upcomingEvents,
  };
};

/**
 * Get Weekly Attendance Trend (Mon-Sun).
 */
export const getAttendanceTrend = async () => {
  const today = new Date();
  // Get Monday of current week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const records = await StudentAttendance.aggregate([
    {
      $match: {
        attendanceDate: { $gte: startOfWeek, $lte: endOfWeek },
        isActive: true,
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$attendanceDate" },
        present: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
  ]);

  // Map _id (1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat) to day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const trendMap = {};

  records.forEach((rec) => {
    const dayName = dayNames[rec._id - 1];
    trendMap[dayName] =
      rec.total > 0 ? Number(((rec.present / rec.total) * 100).toFixed(1)) : 0;
  });

  const fullTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day) => ({
      day,
      percentage: trendMap[day] || 0,
    })
  );

  return fullTrend;
};

/**
 * Get Enquiry Funnel stages.
 */
export const getEnquiryFunnel = async () => {
  const stats = await Enquiry.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const statsMap = {};
  stats.forEach((item) => {
    // Map Closed to Dropped
    const stage = item._id === "Closed" ? "Dropped" : item._id;
    statsMap[stage] = (statsMap[stage] || 0) + item.count;
  });

  return ["New", "Follow Up", "Converted", "Dropped"].map((stage) => ({
    stage,
    count: statsMap[stage] || 0,
  }));
};

/**
 * Get last 6 months collection trend.
 */
export const getCollectionTrend = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const stats = await FeePayment.aggregate([
    {
      $match: {
        paymentDate: { $gte: sixMonthsAgo },
        isActive: true,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$paymentDate" },
          month: { $month: "$paymentDate" },
        },
        total: { $sum: "$amountPaid" },
      },
    },
  ]);

  // Format month names
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Build sequential list of last 6 months
  const list = [];
  const current = new Date(sixMonthsAgo);
  for (let i = 0; i < 6; i++) {
    list.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1, // 1-indexed
      monthName: months[current.getMonth()],
    });
    current.setMonth(current.getMonth() + 1);
  }

  // Map database results
  const statsMap = {};
  stats.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    statsMap[key] = item.total;
  });

  return list.map((item) => ({
    month: item.monthName,
    amount: statsMap[`${item.year}-${item.month}`] || 0,
  }));
};

/**
 * Get latest activity log records.
 */
export const getRecentActivities = async () => {
  return await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
};

/**
 * Get student and staff birthdays for today.
 */
export const getTodayBirthdays = async () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [students, staff] = await Promise.all([
    Student.aggregate([
      {
        $match: {
          isActive: true,
          $expr: {
            $and: [
              { $eq: [{ $dayOfMonth: "$dob" }, day] },
              { $eq: [{ $month: "$dob" }, month] },
            ],
          },
        },
      },
      {
        $project: {
          name: { $concat: ["$firstName", " ", "$lastName"] },
          class: "$className",
          dob: 1,
          type: { $literal: "Student" },
          age: { $subtract: [currentYear, { $year: "$dob" }] },
        },
      },
    ]),

    Staff.aggregate([
      {
        $match: {
          isActive: true,
          $expr: {
            $and: [
              { $eq: [{ $dayOfMonth: "$dob" }, day] },
              { $eq: [{ $month: "$dob" }, month] },
            ],
          },
        },
      },
      {
        $project: {
          name: "$fullName",
          department: 1,
          dob: 1,
          type: { $literal: "Staff" },
          age: { $subtract: [currentYear, { $year: "$dob" }] },
        },
      },
    ]),
  ]);

  return [...students, ...staff];
};

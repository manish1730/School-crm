import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaChartLine,
  FaExclamationCircle,
  FaCalendarAlt,
  FaSpinner,
  FaPlus,
  FaFileInvoiceDollar,
  FaUserPlus,
  FaBirthdayCake,
  FaChevronRight,
  FaSchool,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchDashboardDataThunk } from "../../redux/features/dashboard/dashboardSlice";
import { fetchSchoolProfileThunk } from "../../redux/features/settings/settingsSlice";

// Colors for enquiry donut chart
const FUNNEL_COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#ef4444"]; // Blue, Cyan, Green, Red

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    cards,
    attendanceData,
    enquiryData,
    collectionData,
    activities,
    birthdays,
    loading: dashboardLoading,
    error: dashboardError,
  } = useAppSelector((state) => state.dashboard);

  const {
    schoolProfile,
    loading: profileLoading,
    error: profileError,
  } = useAppSelector((state) => state.settings);

  const loading = dashboardLoading || profileLoading;
  const error = dashboardError || profileError;

  useEffect(() => {
    dispatch(fetchDashboardDataThunk());
    dispatch(fetchSchoolProfileThunk());
  }, [dispatch]);

  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="h-10 w-10 animate-spin text-blue-900" />
          <span className="text-lg font-semibold text-gray-600">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* SCHOOL PROFILE HIGHLIGHT WIDGET */}
      {schoolProfile && (
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            {schoolProfile.logo ? (
              <img
                src={schoolProfile.logo}
                alt={schoolProfile.schoolName}
                className="h-20 w-20 rounded-xl object-contain bg-white p-1.5 shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 text-3xl">
                <FaSchool className="text-blue-300" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wide">{schoolProfile.schoolName}</h2>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-200">
                <span className="flex items-center gap-1.5"><FaMapMarkerAlt /> {schoolProfile.city}, {schoolProfile.state}</span>
                <span>• Board: {schoolProfile.boardAffiliation}</span>
                <span>• Type: {schoolProfile.schoolType}</span>
                <span>• Principal: {schoolProfile.principal}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-right md:text-right text-blue-200 border-t border-white/10 pt-4 md:pt-0 md:border-t-0">
            <span className="flex items-center justify-end gap-1.5"><FaPhoneAlt /> {schoolProfile.phone}</span>
            <span className="flex items-center justify-end gap-1.5"><FaEnvelope /> {schoolProfile.email}</span>
            {schoolProfile.website && (
              <a
                href={schoolProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-white underline transition-colors"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-3">
          <FaExclamationCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TOP ANALYTICS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {/* TOTAL STUDENTS */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-500 p-5 text-white shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Students</span>
              <h3 className="mt-2 text-3xl font-extrabold">{cards.totalStudents.toLocaleString()}</h3>
            </div>
            <div className="rounded-xl bg-white/20 p-3">
              <FaUserGraduate className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs opacity-90 font-medium">
            <span>↑ 5.2% vs last month</span>
          </div>
        </div>

        {/* TOTAL STAFF */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Staff</span>
              <h3 className="mt-2 text-3xl font-extrabold text-gray-900">{cards.totalStaff}</h3>
            </div>
            <div className="rounded-xl bg-gray-50 border p-3">
              <FaChalkboardTeacher className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <span>↑ 2 new vs last month</span>
          </div>
        </div>

        {/* TODAY'S ATTENDANCE */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Today's Attendance</span>
              <h3 className="mt-2 text-3xl font-extrabold text-gray-900">{cards.todayAttendance}%</h3>
            </div>
            <div className="rounded-xl bg-gray-50 border p-3">
              <FaClipboardCheck className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <span>↑ 1.3% vs last month</span>
          </div>
        </div>

        {/* FEE COLLECTION TODAY */}
        <div className="rounded-2xl border border-blue-600 bg-blue-600 p-5 text-white shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Fee Collection Today</span>
              <h3 className="mt-2 text-2xl font-extrabold">{formatCurrency(cards.feeToday)}</h3>
            </div>
            <div className="rounded-xl bg-white/20 p-3">
              <FaMoneyBillWave className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs opacity-90 font-medium">
            <span>↑ 12.5% vs last month</span>
          </div>
        </div>

        {/* MONTHLY COLLECTION */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Monthly Collection</span>
              <h3 className="mt-2 text-2xl font-extrabold text-gray-900">{formatCurrency(cards.feeMonth)}</h3>
            </div>
            <div className="rounded-xl bg-gray-50 border p-3">
              <FaChartLine className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
            <span>Current month stats</span>
          </div>
        </div>

        {/* PENDING DUES */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Dues</span>
              <h3 className="mt-2 text-2xl font-extrabold text-gray-900">{formatCurrency(cards.pendingDues)}</h3>
            </div>
            <div className="rounded-xl bg-gray-50 border p-3">
              <FaExclamationCircle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-red-600 font-medium">
            <span>↓ 3.1% vs last month</span>
          </div>
        </div>

        {/* UPCOMING EVENTS */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Upcoming Events</span>
              <h3 className="mt-2 text-3xl font-extrabold text-gray-900">{cards.upcomingEvents}</h3>
            </div>
            <div className="rounded-xl bg-gray-50 border p-3">
              <FaCalendarAlt className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
            <span>In calendar</span>
          </div>
        </div>

        {/* QUICK CREATES BUTTON CARD */}
        <div className="rounded-2xl border border-blue-50 bg-blue-50/50 p-5 shadow-sm flex flex-col justify-center items-center text-center">
          <h4 className="text-sm font-bold text-blue-900">Need to execute an action?</h4>
          <p className="text-xs text-blue-700/80 mt-1 mb-3">Quickly jump into sections below.</p>
          <button
            onClick={() => navigate("/Admission/Enquiry")}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-800 cursor-pointer"
          >
            <FaPlus />
            <span>Manage Admissions</span>
          </button>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attendance Trend Line Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Attendance Trend This Week</h2>
          <p className="text-xs text-gray-400 mt-1 mb-6">Daily attendance percentage comparison</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, "Present"]} />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enquiry Funnel Donut Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Admission Enquiry Funnel</h2>
          <p className="text-xs text-gray-400 mt-1 mb-4">Total lead pipelines by stages</p>
          <div className="relative flex h-60 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enquiryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="stage"
                >
                  {enquiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-gray-800">
                {enquiryData.reduce((acc, curr) => acc + curr.count, 0)}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Leads</span>
            </div>
          </div>
          {/* Legend Details */}
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-semibold text-gray-600">
            {enquiryData.map((item, idx) => (
              <div key={item.stage} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }}
                />
                <span className="truncate">{item.stage}</span>
                <span className="ml-auto text-gray-900 font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER GRID: COLLECTION TREND & SIDEBAR LISTS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Collection Trend Area Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Collection Trend</h2>
          <p className="text-xs text-gray-400 mt-1 mb-6">Monthly fee collections over the last 6 months</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collectionData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip formatter={(value) => [formatCurrency(value), "Collected"]} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDEBAR WIDGETS COLUMN */}
        <div className="space-y-6">
          {/* TODAY'S BIRTHDAYS */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FaBirthdayCake className="text-pink-500 h-5 w-5" />
              <h2 className="text-lg font-bold text-gray-900">Today's Birthdays</h2>
            </div>
            {birthdays.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No student or staff birthdays today</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {birthdays.map((bday, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-gray-50 p-2.5 hover:bg-gray-50">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600 text-sm">
                      {bday.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{bday.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {bday.type} &bull; {bday.class || bday.department}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="inline-block rounded-full bg-pink-100 px-2 py-0.5 text-[9px] font-bold text-pink-600">
                        {bday.age} Yrs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY LOG */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No recent logs recorded</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
                {activities.map((act) => (
                  <div key={act._id} className="flex gap-3 text-xs leading-normal">
                    <div className="relative flex flex-col items-center">
                      <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span className="w-0.5 flex-1 bg-gray-100 mt-1" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-bold text-gray-800">{act.activityType}</span>
                        <span className="text-[9px] text-gray-400 shrink-0">{getRelativeTime(act.createdAt)}</span>
                      </div>
                      <p className="text-gray-500">{act.description}</p>
                      <p className="text-[9px] text-gray-400 font-medium">Logged by: {act.userName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {/* Add Student */}
          <button
            onClick={() => navigate("/Students/All-Students")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors text-center cursor-pointer"
          >
            <FaUserPlus className="h-5 w-5 text-blue-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Add Student</span>
          </button>

          {/* New Admission */}
          <button
            onClick={() => navigate("/Admission/New-Admission")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors text-center cursor-pointer"
          >
            <FaUserPlus className="h-5 w-5 text-teal-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">New Admission</span>
          </button>

          {/* Record Fee */}
          <button
            onClick={() => navigate("/Fees")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors text-center cursor-pointer"
          >
            <FaFileInvoiceDollar className="h-5 w-5 text-emerald-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Record Fee</span>
          </button>

          {/* Mark Attendance */}
          <button
            onClick={() => navigate("/Attendence")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors text-center cursor-pointer"
          >
            <FaClipboardCheck className="h-5 w-5 text-purple-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Mark Attendance</span>
          </button>

          {/* Add Staff */}
          <button
            onClick={() => navigate("/Staff/All-Staff")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors text-center cursor-pointer"
          >
            <FaChalkboardTeacher className="h-5 w-5 text-indigo-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Add Staff</span>
          </button>

          {/* Create Event */}
          <button
            onClick={() => navigate("/Settings/Masters")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors text-center cursor-pointer"
          >
            <FaCalendarAlt className="h-5 w-5 text-pink-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Create Event</span>
          </button>
        </div>
      </div>
    </div>
  );
}

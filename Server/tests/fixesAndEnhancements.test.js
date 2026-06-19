import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import express from "express";

import User from "../models/User.js";
import AcademicYear from "../models/AcademicYear.js";
import ClassSection from "../models/ClassSection.js";
import ExamType from "../models/ExamType.js";
import Subject from "../models/Subject.js";
import Student from "../models/Student.js";
import StudentAttendance from "../models/StudentAttendance.js";
import Staff from "../models/Staff.js";
import StaffAttendance from "../models/StaffAttendance.js";

import classSectionRoutes from "../routes/classSectionRoutes.js";
import examTypeRoutes from "../routes/examTypeRoutes.js";
import studentAttendanceRoutes from "../routes/studentAttendanceRoutes.js";
import staffAttendanceRoutes from "../routes/staffAttendanceRoutes.js";

dotenv.config();

const PORT = 5002;
const BASE_CLASS = `http://localhost:${PORT}/api/class-sections`;
const BASE_EXAM = `http://localhost:${PORT}/api/exam-types`;
const BASE_STUDENT_ATTENDANCE = `http://localhost:${PORT}/api/attendance/students`;
const BASE_STAFF_ATTENDANCE = `http://localhost:${PORT}/api/attendance/staff`;

async function runTests() {
  console.log("=== STARTING ADDITIONAL FIXES AND ENHANCEMENTS TEST SUITE ===");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Clean test databases
  await User.deleteMany({ email: "testadmin@fixes.com" });
  await AcademicYear.deleteMany({ name: "TEST-YEAR-FIX" });
  await ClassSection.deleteMany({ className: "Test Class" });
  await ExamType.deleteMany({});
  
  // Drop student collection to completely clear duplicate indexes like rollno_1
  try {
    await Student.collection.drop();
  } catch (e) {
    // Ignore if collection doesn't exist
  }
  await Student.deleteMany({ firstName: "TestStudent" });
  await StudentAttendance.deleteMany({});
  await Staff.deleteMany({ name: "TestStaff" });
  await StaffAttendance.deleteMany({});

  // Setup admin user & academic year
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminUser = await User.create({
    name: "Test Admin",
    email: "testadmin@fixes.com",
    password: hashedPassword,
    role: "Admin",
    isActive: true,
  });

  const acadYear = await AcademicYear.create({
    name: "TEST-YEAR-FIX",
    startDate: new Date("2026-06-01"),
    endDate: new Date("2027-05-31"),
    isCurrent: true,
    isActive: true,
  });

  const adminToken = jwt.sign(
    { id: adminUser._id, role: adminUser.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const app = express();
  app.use(express.json());
  // Mock req.user for middlewares
  app.use((req, res, next) => {
    req.user = { id: adminUser._id.toString(), role: "Admin" };
    next();
  });

  app.use("/api/class-sections", classSectionRoutes);
  app.use("/api/exam-types", examTypeRoutes);
  app.use("/api/attendance/students", studentAttendanceRoutes);
  app.use("/api/attendance/staff", staffAttendanceRoutes);

  const server = app.listen(PORT);
  console.log(`Test server listening on port ${PORT}`);

  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, message) {
    if (actual === expected) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message} (Expected: "${expected}", Got: "${actual}")`);
      failed++;
    }
  }

  try {
    // 1. Capacity validation
    console.log("\n--- Testing Class Section Capacity Validation ---");
    const badCapacityRes = await fetch(`${BASE_CLASS}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        className: "Test Class",
        classCode: "TC",
        sectionName: "A",
        sectionCapacity: -5,
        academicYearId: acadYear._id.toString(),
      }),
    });
    assertEqual(badCapacityRes.status, 400, "Negative capacity returns 400 Bad Request");
    const badCapacityJson = await badCapacityRes.json();
    assertEqual(badCapacityJson.message, "Capacity must be greater than 0", "Correct error message returned");

    // 2. Exam weightages validation
    console.log("\n--- Testing Exam Weightage Limits & Sum Validation ---");
    const exam1 = await fetch(`${BASE_EXAM}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        examName: "Test Exam 1",
        examCode: "TE1",
        description: "Test description",
        weightage: 60,
        academicYearId: acadYear._id.toString(),
      }),
    });
    if (exam1.status !== 201) {
      console.log("Exam 1 creation failed with body:", await exam1.json());
    }
    assertEqual(exam1.status, 201, "First exam created with 60% weightage");

    const exam2 = await fetch(`${BASE_EXAM}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        examName: "Test Exam 2",
        examCode: "TE2",
        description: "Test description",
        weightage: 50,
        academicYearId: acadYear._id.toString(),
      }),
    });
    assertEqual(exam2.status, 400, "Second exam exceeding total 100% (60+50) rejects with 400");
    const exam2Json = await exam2.json();
    assertEqual(exam2Json.message, "Total exam weightage cannot exceed 100%", "Correct weightage overflow error message returned");

    // 3. Attendance editing (upsert)
    console.log("\n--- Testing Attendance Upsert Functionality ---");
    const student = await Student.create({
      rollNumber: "TEST001",
      firstName: "TestStudent",
      lastName: "One",
      className: "Test Class",
      sectionName: "A",
      academicYearId: acadYear._id,
      admissionNumber: "ADM001",
      gender: "Male",
      dob: new Date("2015-05-15"),
      category: "General",
      aadhaarNumber: "123456789012",
      phoneNumber: "9876543210",
      address: "123 Street",
      fatherName: "Father",
      fatherPhone: "9876543210",
      motherName: "Mother",
      admissionDate: new Date(),
    });

    const markRes1 = await fetch(`${BASE_STUDENT_ATTENDANCE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        className: "Test Class",
        sectionName: "A",
        attendanceDate: "2026-06-19",
        entries: [{ studentId: student._id.toString(), status: "Present" }],
      }),
    });
    assertEqual(markRes1.status, 200, "First student attendance marked successfully");
    const markJson1 = await markRes1.json();
    assertEqual(markJson1.message, "Attendance updated successfully", "First marking has correct message");

    const markRes2 = await fetch(`${BASE_STUDENT_ATTENDANCE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        className: "Test Class",
        sectionName: "A",
        attendanceDate: "2026-06-19",
        entries: [{ studentId: student._id.toString(), status: "Absent" }],
      }),
    });
    assertEqual(markRes2.status, 200, "Second marking updates existing record instead of throwing duplicate error");
    const markJson2 = await markRes2.json();
    assertEqual(markJson2.message, "Attendance updated successfully", "Second marking returns success message");

    const count = await StudentAttendance.countDocuments({ studentId: student._id });
    assertEqual(count, 1, "Only one attendance document exists in DB (no duplicates created)");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log(`\n=== ADDITIONAL TEST SUITE COMPLETED ===\nPassed: ${passed} | Failed: ${failed}`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

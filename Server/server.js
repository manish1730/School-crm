import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import academicyearRoutes from"./routes/academicYearRoutes.js"
import examTypeRoutes from "./routes/examTypeRoutes.js";
import classSectionRoutes from "./routes/classSectionRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import designationRoutes from "./routes/designationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import academicCalendarRoutes from "./routes/academicCalendarRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import staffAttendanceRoutes from "./routes/staffAttendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import studentAttendanceRoutes from "./routes/studentAttendanceRoutes.js";
import examRoutes from "./routes/examRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/academic-year",academicyearRoutes);
app.use("/api/exam-types", examTypeRoutes);
app.use("/api/class-sections", classSectionRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/academic-calendar", academicCalendarRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff-attendance", staffAttendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/student-attendance", studentAttendanceRoutes);
app.use("/api/exams", examRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("School CRM Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

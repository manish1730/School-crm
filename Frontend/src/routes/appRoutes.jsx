import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/Dasboardlayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import AllStudents from "../pages/Student/AllStudents";
import Promotion from "../pages/Student/Promotion";
import Teacher from "../pages/Teacher/Teacher";
import AllStaff from "../pages/Teacher/AllStaff";
import StaffAttendance from "../pages/Teacher/StaffAttendance";
import LeaveManagement from "../pages/Teacher/LeaveManagement";
import Payroll from "../pages/Teacher/Payroll";
import Attendence from "../pages/Attendence/Attendence";
import Timetable from "../pages/Timetable/Timetable";
import FeeandFinance from "../pages/Fees/FeeandFinance";
import Exams from "../pages/Exams/Exams";
import MarksEntry from "../pages/Exams/MarksEntry";
import ExamResults from "../pages/Exams/ExamResults";
import ReportCard from "../pages/Exams/ReportCard";
import Transport from "../pages/Transport/Transport";
import Admission from "../pages/Admission/Admission";
import Enquiry from "../pages/Admission/Enquiry";
import NewAdmission from "../pages/Admission/NewAdmission";
import Setting from "../pages/Setting/Setting";
import AuditLogs from "../pages/Setting/AuditLogs";
import Integrations from "../pages/Setting/Integrations";
import SchoolProfile from "../pages/Setting/SchoolProfile";
import Masters from "../pages/Setting/Masters-pages/Masters";
import AcademicYears from "../pages/Setting/Masters-pages/AcademicYears";
import ExamTypes from "../pages/Setting/Masters-pages/ExamTypes";
import ClassSections from "../pages/Setting/Masters-pages/ClassSections";
import Subjects from "../pages/Setting/Masters-pages/Subjects";
import Departments from "../pages/Setting/Masters-pages/Departments";
import Designations from "../pages/Setting/Masters-pages/Designations";
import Categories from "../pages/Setting/Masters-pages/Categories";
import AcademicCalendar from "../pages/Setting/Masters-pages/AcademicCalendar";
import ProtectedRoute from "../components/Protectedroutes";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Login" replace />} />
      <Route path="/Login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Students">
          <Route index element={<Navigate to="All-Students" replace />} />
          <Route path="All-Students" element={<AllStudents />} />
          <Route path="Promotion" element={<Promotion />} />
        </Route>
        <Route path="/Staff" element={<Teacher />}>
          <Route index element={<Navigate to="All-Staff" replace />} />
          <Route path="All-Staff" element={<AllStaff />} />
          <Route path="Attendance" element={<StaffAttendance />} />
          <Route path="Leave-Management" element={<LeaveManagement />} />
          <Route path="Payroll" element={<Payroll />} />
        </Route>
        <Route path="/Attendence" element={<Attendence />} />
        <Route path="/Fees" element={<FeeandFinance />} />
        <Route path="/Exams" element={<Exams />}>
          <Route index element={<Navigate to="Marks-Entry" replace />} />
          <Route path="Marks-Entry" element={<MarksEntry />} />
          <Route path="Results" element={<ExamResults />} />
          <Route path="Report-Card" element={<ReportCard />} />
        </Route>
        <Route path="/Admission" element={<Admission />}>
          <Route index element={<Navigate to="Enquiry" replace />} />
          <Route path="Enquiry" element={<Enquiry />} />
          <Route path="New-Admission" element={<NewAdmission />} />
        </Route>
        <Route path="/Settings" element={<Setting />} />
        
      
        <Route path="/Settings/School-Profile" element={<SchoolProfile />} />
        <Route path="/Settings/Masters" element={<Masters />}>
          <Route index element={<Navigate to="Academic-Years" replace />} />
          <Route path="Academic-Years" element={<AcademicYears />} />
          <Route path="Exam-Types" element={<ExamTypes />} />
          <Route path="Class-Sections" element={<ClassSections />} />
          <Route path="Subjects" element={<Subjects />} />
          <Route path="Departments" element={<Departments />} />
          <Route path="Designations" element={<Designations />} />
          <Route path="Categories" element={<Categories />} />
          <Route path="Academic-Calendar" element={<AcademicCalendar />} />
        </Route>
      </Route>
      </Route>
      <Route path="/admission" element={<Navigate to="/Admission/New-Admission" replace />} />
      <Route path="/fees" element={<Navigate to="/Fees" replace />} />
      <Route path="/attendance" element={<Navigate to="/Attendence" replace />} />
      <Route path="/Student" element={<Navigate to="/Students/All-Students" replace />} />
      <Route path="/Teacher" element={<Navigate to="/Staff/All-Staff" replace />} />
      <Route path="/Teacher/All-Staff" element={<Navigate to="/Staff/All-Staff" replace />} />
      <Route path="/Teacher/Staff-Attendance" element={<Navigate to="/Staff/Attendance" replace />} />
      <Route path="/Teacher/Leave-Management" element={<Navigate to="/Staff/Leave-Management" replace />} />
      <Route path="/Teacher/Payroll" element={<Navigate to="/Staff/Payroll" replace />} />
      <Route path="/Exams/Report-Cards" element={<Navigate to="/Exams/Report-Card" replace />} />
      <Route path="/admissions/enquiry" element={<Navigate to="/Students/All-Students" replace />} />

      <Route path="*" element={<Navigate to="/Login" replace />} />
    </Routes>
  );
}

export default AppRoutes;

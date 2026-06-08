import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Student from "./pages/Students/Student.jsx";
import Teacher from "./pages/Teacher/Teacher.jsx";
import Attendence from "./pages/Attendance/Attendence.jsx";
import Timetable from "./pages/Timetable/Timetable.jsx";
import FeeandFinance from "./pages/Fees/FeeandFinance.jsx";
import Exams from "./pages/Exams/Exams.jsx";
import Transport from "./pages/Transport/Transport.jsx";
import Setting from "./pages/Setting/Setting.jsx";
import NewAdmission from "./pages/Admission/NewAdmission";
import Library from "./pages/Library/Library.jsx";
import AuditLogs from "./pages/Setting/AuditLogs.jsx";
import Integrations from "./pages/Setting/Integrations.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/students" element={<Student />} />
      <Route path="/teachers" element={<Teacher />} />
      <Route path="/attendance" element={<Attendence />} />
      <Route path="/timetable" element={<Timetable />} />
      <Route path="/fees" element={<FeeandFinance />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/transport" element={<Transport />} />
      <Route path="/settings" element={<Setting />} />
      <Route path="/library" element={<Library />} />
      <Route path="/admission" element={<NewAdmission />}/>
      <Route path="/settings/auditlogs" element={<AuditLogs />} />
      <Route path="/settings/integrations" element={<Integrations />} />
      


    </Routes>
    // <Login/>
  );
}

export default App;

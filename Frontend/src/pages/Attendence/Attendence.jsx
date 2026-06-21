import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectAllClasses, selectAllSections } from "../../redux/features/master/masterSlice";
import {
  fetchStudentAttendanceThunk,
  saveStudentAttendanceThunk,
  clearAttendanceError,
  clearAttendanceSuccess,
} from "../../redux/features/attendance/attendanceSlice";

const statuses = ["Present", "Absent", "Leave"];

const Attendence = () => {
  const dispatch = useAppDispatch();
  const classSections = useAppSelector((state) => state.master.classSections);
  const {
    students,
    records,
    stats,
    error: reduxError,
    successMessage: reduxSuccess,
  } = useAppSelector((state) => state.attendance);

  const [className, setClassName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  const error = localError || reduxError;
  const successMessage = localSuccess || reduxSuccess;

  useEffect(() => {
    dispatch(clearAttendanceError());
    dispatch(clearAttendanceSuccess());
  }, [dispatch]);

  const classes = useMemo(
    () => [...new Set(classSections.map((item) => item.className))],
    [classSections]
  );

  const sections = useMemo(
    () =>
      classSections
        .filter((item) => item.className === className)
        .map((item) => item.sectionName),
    [classSections, className]
  );

  const fetchAttendance = async () => {
    if (!className || !sectionName) return;
    dispatch(fetchStudentAttendanceThunk({ className, sectionName, date }));
    setAttendance({});
  };

  useEffect(() => {
    fetchAttendance();
  }, [className, sectionName, date]);

  const getMarkedStatus = (studentId) =>
    records.find((record) => record.studentId === studentId)?.status;

  const handleSaveAttendance = async () => {
    setLocalError("");
    setLocalSuccess("");
    dispatch(clearAttendanceError());
    dispatch(clearAttendanceSuccess());

    const entries = students.map((student) => ({
      studentId: student._id,
      status: attendance[student._id] || getMarkedStatus(student._id) || "Present",
    }));

    const resultAction = await dispatch(
      saveStudentAttendanceThunk({
        className,
        sectionName,
        attendanceDate: date,
        entries,
      })
    );

    if (saveStudentAttendanceThunk.fulfilled.match(resultAction)) {
      fetchAttendance();
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Attendance</h1>
        <p className="text-sm text-gray-500">
          Mark and review daily attendance by class and section.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card label="Total Students" value={stats.totalStudents} />
        <Card label="Present" value={stats.present} />
        <Card label="Absent" value={stats.absent} />
        <Card label="Leave" value={stats.leave} />
      </div>

      {error && <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}
      {successMessage && <div className="p-3 rounded-lg bg-green-100 text-green-700">{successMessage}</div>}

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={className}
            onChange={(event) => {
              setClassName(event.target.value);
              setSectionName("");
            }}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          >
            <option value="">Select Class</option>
            {classes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={sectionName}
            onChange={(event) => setSectionName(event.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          >
            <option value="">Select Section</option>
            {sections.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <div className="overflow-x-auto mt-4">
          <div className="grid grid-cols-[1fr_1.5fr_1fr_240px] bg-gray-100 p-4 font-semibold rounded-lg min-w-[760px]">
            <div>Roll Number</div>
            <div>Student Name</div>
            <div>Marked Status</div>
            <div className="text-right">Attendance Status</div>
          </div>

          {students.length === 0 ? (
            <div className="p-4 text-gray-500">Select class and section to display students.</div>
          ) : (
            students.map((student) => (
              <div key={student._id} className="grid grid-cols-[1fr_1.5fr_1fr_240px] p-4 items-center min-w-[760px]">
                <div>{student.rollNumber}</div>
                <div>{student.firstName} {student.lastName}</div>
                <div>{getMarkedStatus(student._id) || "-"}</div>
                <div className="flex justify-end gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setAttendance({ ...attendance, [student._id]: status })}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        (attendance[student._id] || getMarkedStatus(student._id) || "Present") === status
                          ? "bg-blue-900 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveAttendance}
            disabled={!className || !sectionName || students.length === 0}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg disabled:opacity-60"
          >
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attendence;

function Card({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}

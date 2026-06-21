import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchStaffAttendanceThunk,
  markStaffAttendanceThunk,
  clearStaffError,
  clearStaffSuccess,
} from "../../redux/features/staff/staffSlice";

const statuses = ["Present", "Absent", "Leave", "Late"];

export default function StaffAttendance() {
  const dispatch = useAppDispatch();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const {
    attendanceStaff: staff,
    attendanceRecords: records,
    attendanceStats: stats,
    error: reduxError,
    successMessage: reduxSuccess,
  } = useAppSelector((state) => state.staff);

  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  const error = localError || reduxError;
  const successMessage = localSuccess || reduxSuccess;

  const fetchAttendance = async () => {
    dispatch(fetchStaffAttendanceThunk({ date }));
  };

  useEffect(() => {
    dispatch(clearStaffError());
    dispatch(clearStaffSuccess());
    fetchAttendance();
  }, [dispatch, date]);

  const markAttendance = async (staffId, status) => {
    setLocalError("");
    setLocalSuccess("");
    dispatch(clearStaffError());
    dispatch(clearStaffSuccess());

    const resultAction = await dispatch(
      markStaffAttendanceThunk({ staffId, attendanceDate: date, status })
    );

    if (markStaffAttendanceThunk.fulfilled.match(resultAction)) {
      fetchAttendance();
    }
  };

  const getMarkedStatus = (staffId) =>
    records.find((record) => record.staffId?._id === staffId)?.status;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card label="Total Staff" value={stats.totalStaff} />
        <Card label="Present" value={stats.present} />
        <Card label="Absent" value={stats.absent} />
        <Card label="On Leave" value={stats.onLeave} />
      </div>

      {error && <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}
      {successMessage && <div className="p-3 rounded-lg bg-green-100 text-green-700">{successMessage}</div>}

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="bg-gray-100 rounded-lg px-4 py-3 outline-none" />
        <div className="overflow-x-auto mt-4">
          <div className="grid grid-cols-[60px_1.5fr_1fr_1fr_240px] bg-gray-100 p-4 font-semibold rounded-lg min-w-[800px]">
            <div>#</div><div>Name</div><div>Department</div><div>Status</div><div className="text-right">Action</div>
          </div>
          {staff.map((item, index) => (
            <div key={item._id} className="grid grid-cols-[60px_1.5fr_1fr_1fr_240px] p-4 items-center min-w-[800px]">
              <div>{index + 1}</div>
              <div>{item.fullName}</div>
              <div>{item.department}</div>
              <div>{getMarkedStatus(item._id) || "-"}</div>
              <div className="flex justify-end gap-2">
                {statuses.map((status) => (
                  <button key={status} onClick={() => markAttendance(item._id, status)} className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><h2 className="mt-2 text-3xl font-bold">{value}</h2></div>;
}

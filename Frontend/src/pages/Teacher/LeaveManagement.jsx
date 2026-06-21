import { useEffect, useState } from "react";
import MasterModal from "../../components/masters/MasterModal";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchStaffThunk,
  fetchLeaveRequestsThunk,
  createLeaveRequestThunk,
  updateLeaveStatusThunk,
  clearStaffError,
  clearStaffSuccess,
} from "../../redux/features/staff/staffSlice";

const initialForm = { staffId: "", leaveType: "", fromDate: "", toDate: "", reason: "" };

export default function LeaveManagement() {
  const dispatch = useAppDispatch();
  const {
    list: staff,
    leaves,
    leaveStats: stats,
    error: reduxError,
    successMessage: reduxSuccess,
  } = useAppSelector((state) => state.staff);

  const [formData, setFormData] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  const error = localError || reduxError;
  const successMessage = localSuccess || reduxSuccess;

  const fetchData = async () => {
    dispatch(fetchStaffThunk());
    dispatch(fetchLeaveRequestsThunk());
  };

  useEffect(() => {
    dispatch(clearStaffError());
    dispatch(clearStaffSuccess());
    fetchData();
  }, [dispatch]);

  const handleAddLeave = async () => {
    setLocalError("");
    setLocalSuccess("");
    dispatch(clearStaffError());
    dispatch(clearStaffSuccess());

    const resultAction = await dispatch(createLeaveRequestThunk(formData));
    if (createLeaveRequestThunk.fulfilled.match(resultAction)) {
      setShowModal(false);
      setFormData(initialForm);
      fetchData();
    }
  };

  const handleStatus = async (id, status) => {
    setLocalError("");
    setLocalSuccess("");
    dispatch(clearStaffError());
    dispatch(clearStaffSuccess());

    const resultAction = await dispatch(updateLeaveStatusThunk({ id, status }));
    if (updateLeaveStatusThunk.fulfilled.match(resultAction)) {
      fetchData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="text-xl font-semibold">Leave Management</h2><button onClick={() => setShowModal(true)} className="bg-blue-900 text-white px-6 py-2 rounded-lg">+ Add Leave</button></div>
      <div className="grid gap-4 sm:grid-cols-4"><Card label="Total Requests" value={stats.total} /><Card label="Approved" value={stats.approved} /><Card label="Pending" value={stats.pending} /><Card label="Rejected" value={stats.rejected} /></div>
      {error && <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}
      {successMessage && <div className="p-3 rounded-lg bg-green-100 text-green-700">{successMessage}</div>}
      <div className="rounded-2xl bg-white p-4 shadow-sm overflow-x-auto">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_80px_1fr_160px] bg-gray-100 p-4 font-semibold rounded-lg min-w-[940px]"><div>Staff</div><div>Leave Type</div><div>From</div><div>To</div><div>Days</div><div>Status</div><div className="text-right">Action</div></div>
        {leaves.map((leave) => <div key={leave._id} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_80px_1fr_160px] p-4 items-center min-w-[940px]"><div>{leave.staffId?.fullName}</div><div>{leave.leaveType}</div><div>{leave.fromDate?.split("T")[0]}</div><div>{leave.toDate?.split("T")[0]}</div><div>{leave.days}</div><div>{leave.status}</div><div className="flex justify-end gap-2"><button onClick={() => handleStatus(leave._id, "Approved")} className="text-green-600">Approve</button><button onClick={() => handleStatus(leave._id, "Rejected")} className="text-red-600">Reject</button></div></div>)}
      </div>
      {showModal && <MasterModal onClose={() => setShowModal(false)} title="Add Leave Request" footer={<div className="flex justify-end gap-3"><button onClick={() => setShowModal(false)} className="bg-gray-200 px-4 py-2 rounded-lg cursor-pointer">Cancel</button><button onClick={handleAddLeave} className="bg-blue-900 text-white px-5 py-2 rounded-lg cursor-pointer">Save</button></div>}><div className="space-y-4 mb-4"><Select required label="Staff" value={formData.staffId} options={staff.map((item) => ({ label: item.fullName, value: item._id }))} onChange={(value) => setFormData({ ...formData, staffId: value })} /><Input required label="Leave Type" value={formData.leaveType} onChange={(value) => setFormData({ ...formData, leaveType: value })} /><Input required label="From Date" type="date" value={formData.fromDate} onChange={(value) => setFormData({ ...formData, fromDate: value })} /><Input required label="To Date" type="date" value={formData.toDate} onChange={(value) => setFormData({ ...formData, toDate: value })} /><Input required label="Reason" value={formData.reason} onChange={(value) => setFormData({ ...formData, reason: value })} /></div>{error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}</MasterModal>}
    </div>
  );
}

function Card({ label, value }) { return <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><h2 className="mt-2 text-3xl font-bold">{value}</h2></div>; }
function Input({ label, value, onChange, type = "text" }) { return <div><label className="block text-sm font-medium mb-2">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none" /></div>; }
function Select({ label, value, options, onChange }) { return <div><label className="block text-sm font-medium mb-2">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"><option value="">Select {label}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>; }

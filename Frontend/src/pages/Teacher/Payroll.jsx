import { useEffect, useState } from "react";
import MasterModal from "../../components/masters/MasterModal";
import { generatePayroll, getPayroll, getStaff } from "../../services/staffService";

const initialForm = { staffId: "", payrollMonth: "", allowance: 0, deduction: 0, status: "Pending" };

export default function Payroll() {
  const [staff, setStaff] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [stats, setStats] = useState({ totalPayroll: 0, paid: 0, pending: 0, processing: 0 });
  const [formData, setFormData] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    const [staffResponse, payrollResponse] = await Promise.all([getStaff(), getPayroll()]);
    setStaff(staffResponse.data.data || []);
    setPayroll(payrollResponse.data.data.payroll || []);
    setStats(payrollResponse.data.data.stats || stats);
  };

  useEffect(() => { fetchData().catch(() => setError("Failed to load payroll")); }, []);

  const handleGeneratePayroll = async () => {
    try {
      setError("");
      const response = await generatePayroll(formData);
      setSuccessMessage(response.data.message);
      setShowModal(false);
      setFormData(initialForm);
      await fetchData();
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to generate payroll");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="text-xl font-semibold">Payroll</h2><button onClick={() => setShowModal(true)} className="bg-blue-900 text-white px-6 py-2 rounded-lg">Generate Payroll</button></div>
      <div className="grid gap-4 sm:grid-cols-4"><Card label="Total Payroll" value={stats.totalPayroll} /><Card label="Paid" value={stats.paid} /><Card label="Pending" value={stats.pending} /><Card label="Processing" value={stats.processing} /></div>
      {error && <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}
      {successMessage && <div className="p-3 rounded-lg bg-green-100 text-green-700">{successMessage}</div>}
      <div className="rounded-2xl bg-white p-4 shadow-sm overflow-x-auto">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-gray-100 p-4 font-semibold rounded-lg min-w-[900px]"><div>Name</div><div>Designation</div><div>Basic Salary</div><div>Allowance</div><div>Deduction</div><div>Net Salary</div><div>Status</div></div>
        {payroll.map((item) => <div key={item._id} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_1fr] p-4 items-center min-w-[900px]"><div>{item.staffId?.fullName}</div><div>{item.staffId?.designation}</div><div>{item.basicSalary}</div><div>{item.allowance}</div><div>{item.deduction}</div><div>{item.netSalary}</div><div>{item.status}</div></div>)}
      </div>
      {showModal && <MasterModal title="Generate Payroll" footer={<div className="flex justify-end gap-3"><button onClick={() => setShowModal(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button><button onClick={handleGeneratePayroll} className="bg-blue-900 text-white px-5 py-2 rounded-lg">Generate</button></div>}><div className="space-y-4 mb-4"><Select label="Staff" value={formData.staffId} options={staff.map((item) => ({ label: item.fullName, value: item._id }))} onChange={(value) => setFormData({ ...formData, staffId: value })} /><Input label="Payroll Month" type="month" value={formData.payrollMonth} onChange={(value) => setFormData({ ...formData, payrollMonth: value })} /><Input label="Allowance" type="number" value={formData.allowance} onChange={(value) => setFormData({ ...formData, allowance: value })} /><Input label="Deduction" type="number" value={formData.deduction} onChange={(value) => setFormData({ ...formData, deduction: value })} /><Select label="Status" value={formData.status} options={["Paid", "Pending", "Processing"].map((item) => ({ label: item, value: item }))} onChange={(value) => setFormData({ ...formData, status: value })} /></div>{error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}</MasterModal>}
    </div>
  );
}

function Card({ label, value }) { return <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><h2 className="mt-2 text-3xl font-bold">{value}</h2></div>; }
function Input({ label, value, onChange, type = "text" }) { return <div><label className="block text-sm font-medium mb-2">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none" /></div>; }
function Select({ label, value, options, onChange }) { return <div><label className="block text-sm font-medium mb-2">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"><option value="">Select {label}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>; }

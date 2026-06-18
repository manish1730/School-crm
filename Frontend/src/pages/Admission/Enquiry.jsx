import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import MasterModal from "../../components/masters/MasterModal";
import {
  convertEnquiry,
  createEnquiry,
  deleteEnquiry,
  getEnquiries,
  getEnquiryStats,
  updateEnquiry,
} from "../../services/enquiryService";

const sources = [
  "Walk In",
  "Referral",
  "Website",
  "Social Media",
  "Campaign",
  "Other",
];

const statuses = [
  "New",
  "Follow Up",
  "Converted",
  "Closed",
];

const initialForm = {
  studentName: "",
  phoneNumber: "",
  source: "",
  counsellor: "",
  enquiryDate: "",
  status: "New",
};

const validate = ({
  studentName,
  phoneNumber,
  source,
  counsellor,
  status,
}) => {
  if (!studentName || studentName.trim().length < 3) {
    return "Student Name must be at least 3 characters";
  }
  if (!/^\d{10}$/.test(phoneNumber)) {
    return "Phone Number must be exactly 10 digits";
  }
  if (!source) return "Source is required";
  if (!counsellor) return "Counsellor is required";
  if (!status) return "Status is required";
  return null;
};

export default function Enquiry() {
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    newThisWeek: 0,
    converted: 0,
    pendingFollowUp: 0,
  });
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const [listResponse, statsResponse] = await Promise.all([
        getEnquiries({
          search,
          status: statusFilter,
          source: sourceFilter,
        }),
        getEnquiryStats(),
      ]);

      setEnquiries(listResponse.data.data || []);
      setStats(statsResponse.data.data || stats);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [search, statusFilter, sourceFilter]);

  const resetModal = () => {
    setFormData(initialForm);
    setEditId(null);
    setError("");
    setSuccessMessage("");
  };

  const handleAddEnquiry = async () => {
    try {
      setError("");
      setSuccessMessage("");

      const validationMessage = validate(formData);

      if (validationMessage) {
        setError(validationMessage);
        return;
      }

      const response = editId
        ? await updateEnquiry(editId, formData)
        : await createEnquiry(formData);

      setSuccessMessage(response.data.message);
      await fetchEnquiries();

      setTimeout(() => {
        setShowModal(false);
        resetModal();
      }, 1000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to save enquiry");
    }
  };

  const handleEditEnquiry = (enquiry) => {
    setError("");
    setSuccessMessage("");
    setEditId(enquiry._id);
    setFormData({
      studentName: enquiry.studentName || "",
      phoneNumber: enquiry.phoneNumber || "",
      source: enquiry.source || "",
      counsellor: enquiry.counsellor || "",
      enquiryDate: enquiry.enquiryDate?.split("T")[0] || "",
      status: enquiry.status || "New",
    });
    setShowModal(true);
  };

  const handleDeleteEnquiry = async () => {
    try {
      setError("");
      const response = await deleteEnquiry(deleteTarget._id);
      setSuccessMessage(response.data.message);
      setDeleteTarget(null);
      await fetchEnquiries();
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to delete enquiry");
    }
  };

  const handleConvertEnquiry = async (id) => {
    try {
      setError("");
      const response = await convertEnquiry(id);
      setSuccessMessage(response.data.message);
      await fetchEnquiries();
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to convert enquiry");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admission Enquiries</h1>
          <p className="text-sm text-gray-500">
            Track enquiries, follow-ups, and conversion pipeline.
          </p>
        </div>

        <button
          onClick={() => {
            resetModal();
            setShowModal(true);
          }}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg"
        >
          + Add Enquiry
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Enquiries" value={stats.total} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="Converted" value={stats.converted} />
        <StatCard label="Pending Follow-Up" value={stats.pendingFollowUp} />
      </div>

      {error && !showModal && (
        <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>
      )}

      {successMessage && !showModal && (
        <div className="p-3 rounded-lg bg-green-100 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, phone, counsellor"
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          />
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          >
            <option value="">All Sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          >
            <option value="">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto mt-4">
          <div className="grid grid-cols-[60px_1.2fr_1fr_1fr_1fr_1fr_180px] bg-gray-100 p-4 font-semibold rounded-lg min-w-[980px]">
            <div>#</div>
            <div>Student Name</div>
            <div>Phone Number</div>
            <div>Source</div>
            <div>Counsellor</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>

          {loading ? (
            <div className="p-4 text-gray-500">Loading...</div>
          ) : enquiries.length === 0 ? (
            <div className="p-4 text-gray-500">No enquiries found</div>
          ) : (
            enquiries.map((enquiry, index) => (
              <div
                key={enquiry._id}
                className="grid grid-cols-[60px_1.2fr_1fr_1fr_1fr_1fr_180px] p-4 items-center min-w-[980px]"
              >
                <div>{index + 1}</div>
                <div>{enquiry.studentName}</div>
                <div>{enquiry.phoneNumber}</div>
                <div>{enquiry.source}</div>
                <div>{enquiry.counsellor}</div>
                <div>{enquiry.status}</div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleConvertEnquiry(enquiry._id)}
                    disabled={enquiry.status === "Converted"}
                    className="text-xs text-green-600 disabled:text-gray-400"
                  >
                    Convert
                  </button>
                  <button
                    onClick={() => handleEditEnquiry(enquiry)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(enquiry)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <MasterModal
          title={editId ? "Edit Enquiry" : "Add Enquiry"}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEnquiry}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg"
              >
                {editId ? "Update" : "Save"}
              </button>
            </div>
          }
        >
          <div className="space-y-4 mb-4">
            <Input label="Student Name" value={formData.studentName} onChange={(value) => setFormData({ ...formData, studentName: value })} />
            <Input label="Phone Number" value={formData.phoneNumber} onChange={(value) => setFormData({ ...formData, phoneNumber: value })} />
            <Select label="Source" value={formData.source} options={sources} onChange={(value) => setFormData({ ...formData, source: value })} />
            <Input label="Counsellor" value={formData.counsellor} onChange={(value) => setFormData({ ...formData, counsellor: value })} />
            <Input label="Date" type="date" value={formData.enquiryDate} onChange={(value) => setFormData({ ...formData, enquiryDate: value })} />
            <Select label="Status" value={formData.status} options={statuses} onChange={(value) => setFormData({ ...formData, status: value })} />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700">
              {successMessage}
            </div>
          )}
        </MasterModal>
      )}

      {deleteTarget && (
        <MasterModal
          title="Delete Enquiry"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEnquiry}
                className="bg-red-600 text-white px-5 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          }
        >
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this enquiry?
          </p>
        </MasterModal>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

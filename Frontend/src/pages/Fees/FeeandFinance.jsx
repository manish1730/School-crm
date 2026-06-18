import { useEffect, useMemo, useState } from "react";
import { FaDownload, FaEye, FaFileExcel, FaFilePdf, FaPrint, FaTrash } from "react-icons/fa";
import FeeToast from "../../components/FeeToast";
import MasterModal from "../../components/masters/MasterModal";
import {
  categoryService,
  classSectionService,
} from "../../services/masterSetupServices";
import { getAcademicYears } from "../../services/academicYearServices";
import { getStudents } from "../../services/studentService";
import {
  createFeeStructure,
  deleteFeeStructure,
  downloadReceipt,
  exportFeeCollectionsExcel,
  exportFeeCollectionsPdf,
  exportFeeStructuresExcel,
  exportFeeStructuresPdf,
  getFeeCollections,
  getFeeStructures,
  getReceipt,
  getStudentFeeSummary,
  recordFeePayment,
  updateFeeStructure,
} from "../../services/feeService";

const feeHeads = ["Tuition", "Admission", "Exam", "Transport", "Annual Charges"];
const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];
const statuses = ["Paid", "Partial", "Pending", "Overdue"];
const limit = 10;

const initialStructureForm = {
  academicYearId: "",
  classSectionId: "",
  tuitionFee: "",
  admissionFee: "",
  examFee: "",
  transportFee: "",
  annualCharges: "",
  dueDate: "",
  waivers: {
    staffChildDiscount: "",
    scDiscount: "",
    stDiscount: "",
    obcDiscount: "",
    ewsDiscount: "",
  },
};

const initialPaymentForm = {
  studentId: "",
  academicYearId: "",
  feeHead: "",
  paymentDate: new Date().toISOString().split("T")[0],
  amountPaid: "",
  paymentMode: "",
  transactionReference: "",
  remarks: "",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const saveBlob = (response, filename) => {
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const printBlob = (response) => {
  const url = URL.createObjectURL(response.data);
  const printWindow = window.open(url, "_blank");

  if (printWindow) {
    printWindow.onload = () => printWindow.print();
  }
};

function Card({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="mt-2 text-2xl font-bold">{value}</h2>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", min }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FeeandFinance() {
  const [activeTab, setActiveTab] = useState("collection");
  const [academicYears, setAcademicYears] = useState([]);
  const [classSections, setClassSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [students, setStudents] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionStats, setCollectionStats] = useState({
    totalStudents: 0,
    totalCollected: 0,
    pendingAmount: 0,
    overduePayments: 0,
  });
  const [collectionFilters, setCollectionFilters] = useState({
    search: "",
    status: "",
    feeHead: "",
    dateFrom: "",
    dateTo: "",
    academicYearId: "",
    className: "",
  });
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionTotal, setCollectionTotal] = useState(0);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [structures, setStructures] = useState([]);
  const [structureFilters, setStructureFilters] = useState({
    search: "",
    academicYearId: "",
    classSectionId: "",
  });
  const [structurePage, setStructurePage] = useState(1);
  const [structureTotal, setStructureTotal] = useState(0);
  const [structureLoading, setStructureLoading] = useState(false);
  const [structureForm, setStructureForm] = useState(initialStructureForm);
  const [editStructureId, setEditStructureId] = useState(null);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState("");
  const [toast, setToast] = useState(null);

  const classOptions = useMemo(
    () => [...new Set(classSections.map((item) => item.className))]
      .map((className) => ({ label: className, value: className })),
    [classSections]
  );

  const academicYearOptions = academicYears.map((item) => ({
    label: item.name,
    value: item._id,
  }));

  const classSectionOptions = classSections.map((item) => ({
    label: `${item.className} - ${item.sectionName}`,
    value: item._id,
  }));

  const studentOptions = students.map((item) => ({
    label: `${item.firstName} ${item.lastName} (${item.admissionNumber})`,
    value: item._id,
  }));

  const collectionTotalPages = Math.max(1, Math.ceil(collectionTotal / limit));
  const structureTotalPages = Math.max(1, Math.ceil(structureTotal / limit));

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMasters = async () => {
    try {
      const [yearsResponse, sectionsResponse, categoriesResponse, studentsResponse] =
        await Promise.all([
          getAcademicYears(),
          classSectionService.getAll({ page: 1, limit: 1000 }),
          categoryService.getAll({ page: 1, limit: 1000 }),
          getStudents(),
        ]);

      const years = yearsResponse.data.data || [];
      setAcademicYears(years);
      setClassSections(sectionsResponse.data.data || []);
      setCategories(categoriesResponse.data.data || []);
      setStudents(studentsResponse.data.data || []);

      const currentYear = years.find((item) => item.isCurrent) || years[0];
      if (currentYear) {
        setCollectionFilters((current) => ({
          ...current,
          academicYearId: current.academicYearId || currentYear._id,
        }));
        setStructureForm((current) => ({
          ...current,
          academicYearId: current.academicYearId || currentYear._id,
        }));
        setPaymentForm((current) => ({
          ...current,
          academicYearId: current.academicYearId || currentYear._id,
        }));
      }
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to load fee master data"));
    }
  };

  const fetchCollections = async () => {
    try {
      setCollectionLoading(true);
      const response = await getFeeCollections({
        ...collectionFilters,
        page: collectionPage,
        limit,
      });
      setCollections(response.data.data?.collections || []);
      setCollectionStats(response.data.data?.stats || collectionStats);
      setCollectionTotal(response.data.total || 0);
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to load fee collections"));
    } finally {
      setCollectionLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      setStructureLoading(true);
      const response = await getFeeStructures({
        ...structureFilters,
        page: structurePage,
        limit,
      });
      setStructures(response.data.data || []);
      setStructureTotal(response.data.total || 0);
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to load fee structures"));
    } finally {
      setStructureLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    if (activeTab === "collection") {
      fetchCollections();
    }
  }, [activeTab, collectionFilters, collectionPage]);

  useEffect(() => {
    if (activeTab === "structure") {
      fetchStructures();
    }
  }, [activeTab, structureFilters, structurePage]);

  const validateStructure = () => {
    if (!structureForm.academicYearId) return "Academic Year is required";
    if (!structureForm.classSectionId) return "Class Group is required";

    for (const field of ["tuitionFee", "admissionFee", "examFee", "transportFee", "annualCharges"]) {
      if (structureForm[field] === "") return `${field} is required`;
      if (Number(structureForm[field]) < 0) return `${field} cannot be negative`;
    }

    for (const [key, value] of Object.entries(structureForm.waivers)) {
      if (value !== "" && (Number(value) < 0 || Number(value) > 100)) {
        return `${key} must be between 0 and 100`;
      }
    }

    return null;
  };

  const handleSaveStructure = async () => {
    const validationMessage = validateStructure();

    if (validationMessage) {
      showToast("error", validationMessage);
      return;
    }

    try {
      setSaving(true);
      const response = editStructureId
        ? await updateFeeStructure(editStructureId, structureForm)
        : await createFeeStructure(structureForm);

      showToast("success", response.data.message);
      setShowStructureModal(false);
      setEditStructureId(null);
      setStructureForm(initialStructureForm);
      await fetchStructures();
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to save fee structure"));
    } finally {
      setSaving(false);
    }
  };

  const openEditStructure = (structure) => {
    setEditStructureId(structure._id);
    setStructureForm({
      academicYearId: structure.academicYearId?._id || "",
      classSectionId: structure.classSectionId?._id || "",
      tuitionFee: structure.tuitionFee ?? "",
      admissionFee: structure.admissionFee ?? "",
      examFee: structure.examFee ?? "",
      transportFee: structure.transportFee ?? "",
      annualCharges: structure.annualCharges ?? "",
      dueDate: structure.dueDate ? structure.dueDate.split("T")[0] : "",
      waivers: {
        staffChildDiscount: structure.waivers?.staffChildDiscount ?? "",
        scDiscount: structure.waivers?.scDiscount ?? "",
        stDiscount: structure.waivers?.stDiscount ?? "",
        obcDiscount: structure.waivers?.obcDiscount ?? "",
        ewsDiscount: structure.waivers?.ewsDiscount ?? "",
      },
    });
    setShowStructureModal(true);
  };

  const handleDeleteStructure = async () => {
    try {
      setSaving(true);
      const response = await deleteFeeStructure(deleteTarget._id);
      showToast("success", response.data.message);
      setDeleteTarget(null);
      await fetchStructures();
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to delete fee structure"));
    } finally {
      setSaving(false);
    }
  };

  const updatePaymentSummary = async (studentId, academicYearId) => {
    if (!studentId || !academicYearId) {
      setPaymentSummary(null);
      return;
    }

    try {
      const response = await getStudentFeeSummary(studentId, { academicYearId });
      setPaymentSummary(response.data.data);
    } catch (error) {
      setPaymentSummary(null);
      showToast("error", getErrorMessage(error, "Failed to load student fee summary"));
    }
  };

  const openPaymentModal = (collection) => {
    const nextForm = {
      ...initialPaymentForm,
      studentId: collection.student._id,
      academicYearId: collection.academicYear._id,
    };
    setPaymentForm(nextForm);
    setPaymentSummary(collection);
    setShowPaymentModal(true);
  };

  const validatePayment = () => {
    if (!paymentForm.studentId) return "Please select a student.";
    if (!paymentForm.academicYearId) return "Academic Year is required";
    if (!paymentForm.feeHead) return "Fee Head is required";
    if (!paymentForm.amountPaid) return "Payment amount is required.";
    if (Number(paymentForm.amountPaid) <= 0) return "Payment amount must be greater than 0";
    if (paymentSummary && Number(paymentForm.amountPaid) > Number(paymentSummary.remainingAmount)) {
      return "Amount exceeds remaining balance.";
    }
    if (!paymentForm.paymentDate) return "Payment Date is required";
    if (new Date(paymentForm.paymentDate) > new Date()) return "Payment Date cannot be future date";
    if (!paymentForm.paymentMode) return "Payment Mode is required";
    if (paymentForm.paymentMode !== "Cash" && !paymentForm.transactionReference.trim()) {
      return "Transaction Reference is required";
    }
    if (paymentForm.remarks.length > 500) return "Remarks cannot exceed 500 characters";
    return null;
  };

  const handleRecordPayment = async () => {
    const validationMessage = validatePayment();

    if (validationMessage) {
      showToast("error", validationMessage);
      return;
    }

    try {
      setSaving(true);
      const response = await recordFeePayment(paymentForm);
      showToast("success", response.data.message);
      setShowPaymentModal(false);
      setPaymentForm(initialPaymentForm);
      setPaymentSummary(null);
      await fetchCollections();
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to record payment"));
    } finally {
      setSaving(false);
    }
  };

  const handleViewReceipt = async (receiptId) => {
    try {
      const response = await getReceipt(receiptId);
      setReceipt(response.data.data);
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to load receipt"));
    }
  };

  const handleDownloadReceipt = async (receiptId, print = false) => {
    try {
      setExporting(receiptId);
      const response = await downloadReceipt(receiptId);
      if (print) {
        printBlob(response);
      } else {
        saveBlob(response, "fee-receipt.pdf");
      }
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to download receipt"));
    } finally {
      setExporting("");
    }
  };

  const handleExport = async (type, format) => {
    try {
      setExporting(`${type}-${format}`);
      const isCollection = type === "collection";
      const params = isCollection ? collectionFilters : structureFilters;
      const response = isCollection
        ? format === "pdf"
          ? await exportFeeCollectionsPdf(params)
          : await exportFeeCollectionsExcel(params)
        : format === "pdf"
          ? await exportFeeStructuresPdf(params)
          : await exportFeeStructuresExcel(params);

      saveBlob(
        response,
        `${type === "collection" ? "fee-collection" : "fee-structure"}.${format === "pdf" ? "pdf" : "xlsx"}`
      );
    } catch (error) {
      showToast("error", getErrorMessage(error, "Failed to export fee data"));
    } finally {
      setExporting("");
    }
  };

  const resetCollectionFilter = (key, value) => {
    setCollectionFilters((current) => ({ ...current, [key]: value }));
    setCollectionPage(1);
  };

  const resetStructureFilter = (key, value) => {
    setStructureFilters((current) => ({ ...current, [key]: value }));
    setStructurePage(1);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <FeeToast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Fees & Finance</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Manage fee structures, collections, receipts and exports
        </p>
      </div>

      <div className="rounded-2xl bg-gray-100 p-2 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {[
            { label: "Fee Collection", value: "collection" },
            { label: "Fee Structure", value: "structure" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm sm:text-base transition-all ${
                activeTab === tab.value
                  ? "bg-white text-blue-900 shadow font-semibold"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "collection" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card label="Total Students" value={collectionStats.totalStudents} />
            <Card label="Total Fee Collected" value={money(collectionStats.totalCollected)} />
            <Card label="Pending Amount" value={money(collectionStats.pendingAmount)} />
            <Card label="Overdue Payments" value={collectionStats.overduePayments} />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                label="Search Student"
                value={collectionFilters.search}
                onChange={(value) => resetCollectionFilter("search", value)}
              />
              <Select
                label="Academic Year"
                value={collectionFilters.academicYearId}
                options={academicYearOptions}
                onChange={(value) => resetCollectionFilter("academicYearId", value)}
              />
              <Select
                label="Class"
                value={collectionFilters.className}
                options={classOptions}
                onChange={(value) => resetCollectionFilter("className", value)}
              />
              <Select
                label="Status"
                value={collectionFilters.status}
                options={statuses.map((item) => ({ label: item, value: item }))}
                onChange={(value) => resetCollectionFilter("status", value)}
              />
              <Select
                label="Fee Head"
                value={collectionFilters.feeHead}
                options={feeHeads.map((item) => ({ label: item, value: item }))}
                onChange={(value) => resetCollectionFilter("feeHead", value)}
              />
              <Input
                label="Paid Date From"
                type="date"
                value={collectionFilters.dateFrom}
                onChange={(value) => resetCollectionFilter("dateFrom", value)}
              />
              <Input
                label="Paid Date To"
                type="date"
                value={collectionFilters.dateTo}
                onChange={(value) => resetCollectionFilter("dateTo", value)}
              />
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => handleExport("collection", "pdf")}
                  disabled={!!exporting}
                  className="flex items-center gap-2 bg-blue-900 text-white px-4 py-3 rounded-lg disabled:opacity-60"
                >
                  <FaFilePdf /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("collection", "excel")}
                  disabled={!!exporting}
                  className="flex items-center gap-2 bg-green-700 text-white px-4 py-3 rounded-lg disabled:opacity-60"
                >
                  <FaFileExcel /> Excel
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm overflow-x-auto">
            <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_150px] bg-gray-100 p-4 font-semibold rounded-lg min-w-[1220px]">
              <div>Student Name</div>
              <div>Admission No.</div>
              <div>Class</div>
              <div>Section</div>
              <div>Father Name</div>
              <div>Total Fee</div>
              <div>Paid</div>
              <div>Remaining</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            {collectionLoading ? (
              <div className="p-4 text-gray-500">Loading...</div>
            ) : collections.length === 0 ? (
              <div className="p-4 text-gray-500">No fee records found</div>
            ) : (
              collections.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_150px] p-4 items-center min-w-[1220px]"
                >
                  <div>{item.student.firstName} {item.student.lastName}</div>
                  <div>{item.student.admissionNumber}</div>
                  <div>{item.student.className}</div>
                  <div>{item.student.sectionName}</div>
                  <div>{item.student.fatherName}</div>
                  <div>{money(item.totalFee)}</div>
                  <div>{money(item.paidAmount)}</div>
                  <div>{money(item.remainingAmount)}</div>
                  <div>{item.status}</div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openPaymentModal(item)}
                      disabled={item.remainingAmount <= 0}
                      className="bg-blue-900 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            page={collectionPage}
            totalPages={collectionTotalPages}
            onPageChange={setCollectionPage}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Fee Structure</h2>
                <p className="text-sm text-gray-500">
                  Configure one fee structure per academic year and class group.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditStructureId(null);
                  setStructureForm({
                    ...initialStructureForm,
                    academicYearId: collectionFilters.academicYearId,
                  });
                  setShowStructureModal(true);
                }}
                className="bg-blue-900 text-white px-6 py-2 rounded-lg"
              >
                + Add Fee Structure
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <Input
                label="Search"
                value={structureFilters.search}
                onChange={(value) => resetStructureFilter("search", value)}
              />
              <Select
                label="Academic Year"
                value={structureFilters.academicYearId}
                options={academicYearOptions}
                onChange={(value) => resetStructureFilter("academicYearId", value)}
              />
              <Select
                label="Class Group"
                value={structureFilters.classSectionId}
                options={classSectionOptions}
                onChange={(value) => resetStructureFilter("classSectionId", value)}
              />
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => handleExport("structure", "pdf")}
                  disabled={!!exporting}
                  className="flex items-center gap-2 bg-blue-900 text-white px-4 py-3 rounded-lg disabled:opacity-60"
                >
                  <FaFilePdf /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("structure", "excel")}
                  disabled={!!exporting}
                  className="flex items-center gap-2 bg-green-700 text-white px-4 py-3 rounded-lg disabled:opacity-60"
                >
                  <FaFileExcel /> Excel
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm overflow-x-auto">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1.2fr_120px] bg-gray-100 p-4 font-semibold rounded-lg min-w-[1180px]">
              <div>Academic Year</div>
              <div>Class Group</div>
              <div>Tuition</div>
              <div>Admission</div>
              <div>Exam</div>
              <div>Transport</div>
              <div>Annual</div>
              <div>Waivers</div>
              <div className="text-right">Actions</div>
            </div>
            {structureLoading ? (
              <div className="p-4 text-gray-500">Loading...</div>
            ) : structures.length === 0 ? (
              <div className="p-4 text-gray-500">No fee structures found</div>
            ) : (
              structures.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1.2fr_120px] p-4 items-center min-w-[1180px]"
                >
                  <div>{item.academicYearId?.name}</div>
                  <div>{item.classSectionId?.className} - {item.classSectionId?.sectionName}</div>
                  <div>{money(item.tuitionFee)}</div>
                  <div>{money(item.admissionFee)}</div>
                  <div>{money(item.examFee)}</div>
                  <div>{money(item.transportFee)}</div>
                  <div>{money(item.annualCharges)}</div>
                  <div className="text-sm">
                    SC {item.waivers?.scDiscount || 0}% / ST {item.waivers?.stDiscount || 0}% / OBC {item.waivers?.obcDiscount || 0}%
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => openEditStructure(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            page={structurePage}
            totalPages={structureTotalPages}
            onPageChange={setStructurePage}
          />
        </div>
      )}

      {showStructureModal && (
        <MasterModal
          title={editStructureId ? "Edit Fee Structure" : "Add Fee Structure"}
          footer={
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowStructureModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStructure}
                disabled={saving}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving..." : editStructureId ? "Update" : "Save"}
              </button>
            </div>
          }
        >
          <div className="space-y-4 mb-4">
            <Select
              label="Academic Year"
              value={structureForm.academicYearId}
              options={academicYearOptions}
              onChange={(value) => setStructureForm({ ...structureForm, academicYearId: value })}
            />
            <Select
              label="Class Group"
              value={structureForm.classSectionId}
              options={classSectionOptions}
              onChange={(value) => setStructureForm({ ...structureForm, classSectionId: value })}
            />
            <Input label="Tuition Fee" type="number" min="0" value={structureForm.tuitionFee} onChange={(value) => setStructureForm({ ...structureForm, tuitionFee: value })} />
            <Input label="Admission Fee" type="number" min="0" value={structureForm.admissionFee} onChange={(value) => setStructureForm({ ...structureForm, admissionFee: value })} />
            <Input label="Exam Fee" type="number" min="0" value={structureForm.examFee} onChange={(value) => setStructureForm({ ...structureForm, examFee: value })} />
            <Input label="Transport Fee" type="number" min="0" value={structureForm.transportFee} onChange={(value) => setStructureForm({ ...structureForm, transportFee: value })} />
            <Input label="Annual Charges" type="number" min="0" value={structureForm.annualCharges} onChange={(value) => setStructureForm({ ...structureForm, annualCharges: value })} />
            <Input label="Due Date" type="date" value={structureForm.dueDate} onChange={(value) => setStructureForm({ ...structureForm, dueDate: value })} />
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-sm font-semibold mb-3">Fee Waivers</p>
              <p className="text-xs text-gray-500 mb-3">
                Categories loaded from Master Setup: {categories.length}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["staffChildDiscount", "Staff Child Discount %"],
                  ["scDiscount", "SC Discount %"],
                  ["stDiscount", "ST Discount %"],
                  ["obcDiscount", "OBC Discount %"],
                  ["ewsDiscount", "EWS Discount %"],
                ].map(([key, label]) => (
                  <Input
                    key={key}
                    label={label}
                    type="number"
                    min="0"
                    value={structureForm.waivers[key]}
                    onChange={(value) =>
                      setStructureForm({
                        ...structureForm,
                        waivers: { ...structureForm.waivers, [key]: value },
                      })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </MasterModal>
      )}

      {showPaymentModal && (
        <MasterModal
          title="Record Payment"
          footer={
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                disabled={saving}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving..." : "Record Payment"}
              </button>
            </div>
          }
        >
          <div className="space-y-4 mb-4">
            <Select
              label="Student"
              value={paymentForm.studentId}
              options={studentOptions}
              onChange={(value) => {
                const nextForm = { ...paymentForm, studentId: value };
                setPaymentForm(nextForm);
                updatePaymentSummary(value, nextForm.academicYearId);
              }}
            />
            <Select
              label="Academic Year"
              value={paymentForm.academicYearId}
              options={academicYearOptions}
              onChange={(value) => {
                const nextForm = { ...paymentForm, academicYearId: value };
                setPaymentForm(nextForm);
                updatePaymentSummary(nextForm.studentId, value);
              }}
            />
            {paymentSummary && (
              <div className="rounded-lg bg-gray-100 p-3 text-sm">
                <p>Total Fee: {money(paymentSummary.totalFee)}</p>
                <p>Paid: {money(paymentSummary.paidAmount)}</p>
                <p>Remaining: {money(paymentSummary.remainingAmount)}</p>
                <p>Status: {paymentSummary.status}</p>
              </div>
            )}
            <Select
              label="Fee Head"
              value={paymentForm.feeHead}
              options={feeHeads.map((item) => ({ label: item, value: item }))}
              onChange={(value) => setPaymentForm({ ...paymentForm, feeHead: value })}
            />
            <Input label="Payment Date" type="date" value={paymentForm.paymentDate} onChange={(value) => setPaymentForm({ ...paymentForm, paymentDate: value })} />
            <Input label="Amount Paid" type="number" min="1" value={paymentForm.amountPaid} onChange={(value) => setPaymentForm({ ...paymentForm, amountPaid: value })} />
            <Select
              label="Payment Mode"
              value={paymentForm.paymentMode}
              options={paymentModes.map((item) => ({ label: item, value: item }))}
              onChange={(value) => setPaymentForm({ ...paymentForm, paymentMode: value })}
            />
            <Input label="Transaction Reference" value={paymentForm.transactionReference} onChange={(value) => setPaymentForm({ ...paymentForm, transactionReference: value })} />
            <div>
              <label className="block text-sm font-medium mb-2">Remarks</label>
              <textarea
                value={paymentForm.remarks}
                onChange={(event) => setPaymentForm({ ...paymentForm, remarks: event.target.value })}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none min-h-24"
              />
            </div>
          </div>
        </MasterModal>
      )}

      {deleteTarget && (
        <MasterModal
          title="Delete Fee Structure"
          footer={
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStructure}
                disabled={saving}
                className="bg-red-600 text-white px-5 py-2 rounded-lg disabled:opacity-60"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          }
        >
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this fee structure?
          </p>
        </MasterModal>
      )}

      {receipt && (
        <MasterModal
          title="Fee Receipt"
          footer={
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(receipt._id)}
                className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg"
              >
                <FaDownload /> Download
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(receipt._id, true)}
                className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <FaPrint /> Print
              </button>
            </div>
          }
        >
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Receipt Number:</strong> {receipt.receiptNumber}</p>
            <p><strong>Student:</strong> {receipt.studentId?.firstName} {receipt.studentId?.lastName}</p>
            <p><strong>Admission Number:</strong> {receipt.studentId?.admissionNumber}</p>
            <p><strong>Fee Head:</strong> {receipt.paymentId?.feeHead}</p>
            <p><strong>Amount Paid:</strong> {money(receipt.paymentId?.amountPaid)}</p>
            <p><strong>Payment Mode:</strong> {receipt.paymentId?.paymentMode}</p>
          </div>
        </MasterModal>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex flex-wrap justify-end items-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          className={`px-3 py-2 rounded-lg ${
            item === page ? "bg-blue-900 text-white" : "bg-gray-200"
          }`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

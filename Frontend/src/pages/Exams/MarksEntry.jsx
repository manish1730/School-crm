import { useEffect, useMemo, useState } from "react";
import {
  classSectionService,
  examTypeService,
  subjectService,
} from "../../services/masterSetupServices";
import { getMarksEntryStudents, saveMarks } from "../../services/examService";

export default function MarksEntry() {
  const [classSections, setClassSections] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ className: "", sectionName: "", examType: "", subject: "", maximumMarks: 100 });
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchMasters = async () => {
      const [classes, exams, subjectResponse] = await Promise.all([
        classSectionService.getAll(),
        examTypeService.getAll(),
        subjectService.getAll(),
      ]);
      setClassSections(classes.data.data || []);
      setExamTypes(exams.data.data || []);
      setSubjects(subjectResponse.data.data || []);
    };
    fetchMasters().catch(() => setError("Failed to load exam master data"));
  }, []);

  const classes = useMemo(() => [...new Set(classSections.map((item) => item.className))], [classSections]);
  const sections = useMemo(() => classSections.filter((item) => item.className === filters.className).map((item) => item.sectionName), [classSections, filters.className]);

  const fetchStudents = async () => {
    try {
      setError("");
      const response = await getMarksEntryStudents(filters);
      setStudents(response.data.data.students || []);
      const existingMarks = {};
      (response.data.data.marks || []).forEach((mark) => {
        existingMarks[mark.studentId] = mark.obtainedMarks;
      });
      setMarks(existingMarks);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load marks grid");
    }
  };

  const handleSaveMarks = async () => {
    try {
      setError("");
      setSuccessMessage("");
      const entries = students.map((student) => ({ studentId: student._id, obtainedMarks: Number(marks[student._id] || 0) }));
      const response = await saveMarks({ ...filters, entries });
      setSuccessMessage(response.data.message);
      await fetchStudents();
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to save marks");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
      {error && <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}
      {successMessage && <div className="p-3 rounded-lg bg-green-100 text-green-700">{successMessage}</div>}
      <div className="grid gap-3 md:grid-cols-5">
        <Select label="Class" value={filters.className} options={classes} onChange={(value) => setFilters({ ...filters, className: value, sectionName: "" })} />
        <Select label="Section" value={filters.sectionName} options={sections} onChange={(value) => setFilters({ ...filters, sectionName: value })} />
        <Select label="Exam Type" value={filters.examType} options={examTypes.map((item) => item.examName)} onChange={(value) => setFilters({ ...filters, examType: value })} />
        <Select label="Subject" value={filters.subject} options={subjects.map((item) => item.subjectName)} onChange={(value) => setFilters({ ...filters, subject: value })} />
        <Input label="Maximum Marks" type="number" value={filters.maximumMarks} onChange={(value) => setFilters({ ...filters, maximumMarks: value })} />
      </div>
      <button onClick={fetchStudents} className="bg-blue-900 text-white px-6 py-2 rounded-lg">Load Students</button>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[1fr_1.5fr_1fr] bg-gray-100 p-4 font-semibold rounded-lg min-w-[640px]"><div>Roll Number</div><div>Student Name</div><div>Marks</div></div>
        {students.map((student) => <div key={student._id} className="grid grid-cols-[1fr_1.5fr_1fr] p-4 items-center min-w-[640px]"><div>{student.rollNumber}</div><div>{student.firstName} {student.lastName}</div><div><input type="number" value={marks[student._id] ?? ""} onChange={(e) => setMarks({ ...marks, [student._id]: e.target.value })} className="w-full bg-gray-100 rounded-lg px-4 py-2 outline-none" /></div></div>)}
      </div>
      {students.length > 0 && <div className="flex justify-end"><button onClick={handleSaveMarks} className="bg-blue-900 text-white px-6 py-2 rounded-lg">Save Marks</button></div>}
    </div>
  );
}

function Select({ label, value, options, onChange }) { return <div><label className="block text-sm font-medium mb-2">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"><option value="">Select {label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>; }
function Input({ label, value, onChange, type = "text" }) { return <div><label className="block text-sm font-medium mb-2">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none" /></div>; }

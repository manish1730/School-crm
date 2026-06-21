import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import MasterModal from "../../components/masters/MasterModal";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchStudentsThunk,
  deleteStudentThunk,
  clearStudentError,
  clearStudentSuccess,
} from "../../redux/features/students/studentsSlice";

const Student = () => {
  const dispatch = useAppDispatch();
  const { list: students, loading, error, successMessage } = useAppSelector(
    (state) => state.students
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentsThunk({ search, status }));
  }, [dispatch, search, status]);

  const handleDeleteStudent = async () => {
    if (deleteTarget) {
      const resultAction = await dispatch(deleteStudentThunk(deleteTarget._id));
      if (deleteStudentThunk.fulfilled.match(resultAction)) {
        setDeleteTarget(null);
        dispatch(fetchStudentsThunk({ search, status }));
      }
    }
  };

  const exportStudents = () => {
    const header = [
      "Admission Number",
      "Student Name",
      "Class",
      "Section",
      "Phone",
      "Father Name",
      "Status",
    ];

    const rows = students.map((student) => [
      student.admissionNumber,
      `${student.firstName} ${student.lastName}`,
      student.className,
      student.sectionName,
      student.phoneNumber,
      student.fatherName,
      student.status,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Students</h1>
          <p className="text-sm text-gray-500">
            Student listing generated from completed admissions.
          </p>
        </div>
        <button
          onClick={exportStudents}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg"
        >
          Export
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-green-100 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search admission number, student, phone, father"
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
          </select>
        </div>

        <div className="overflow-x-auto mt-4">
          <div className="grid grid-cols-[60px_1fr_1.2fr_1fr_1fr_1fr_1fr_90px] bg-gray-100 p-4 font-semibold rounded-lg min-w-[980px]">
            <div>#</div>
            <div>Admission Number</div>
            <div>Student Name</div>
            <div>Class</div>
            <div>Section</div>
            <div>Phone</div>
            <div>Father Name</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="p-4 text-gray-500">Loading...</div>
          ) : students.length === 0 ? (
            <div className="p-4 text-gray-500">No students found</div>
          ) : (
            students.map((student, index) => (
              <div
                key={student._id}
                className="grid grid-cols-[60px_1fr_1.2fr_1fr_1fr_1fr_1fr_90px] p-4 items-center min-w-[980px]"
              >
                <div>{index + 1}</div>
                <div>{student.admissionNumber}</div>
                <div>{student.firstName} {student.lastName}</div>
                <div>{student.className}</div>
                <div>{student.sectionName}</div>
                <div>{student.phoneNumber}</div>
                <div>{student.fatherName}</div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setDeleteTarget(student)}
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

      {deleteTarget && (
        <MasterModal
          title="Delete Student"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="bg-red-600 text-white px-5 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          }
        >
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this student?
          </p>
        </MasterModal>
      )}
    </div>
  );
};

export default Student;

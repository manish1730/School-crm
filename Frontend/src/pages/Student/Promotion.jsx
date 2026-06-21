import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchMasterDataThunk } from "../../redux/features/master/masterSlice";
import {
  fetchStudentsThunk,
  promoteStudentsThunk,
  clearStudentError,
  clearStudentSuccess,
} from "../../redux/features/students/studentsSlice";

const Promotion = () => {
  const dispatch = useAppDispatch();
  const classSections = useAppSelector((state) => state.master.classSections || []);
  const {
    list: students,
    loading,
    actionLoading: promoting,
    error: studentError,
    successMessage: studentSuccess,
  } = useAppSelector((state) => state.students);

  const [fromClass, setFromClass] = useState("");
  const [fromSection, setFromSection] = useState("");
  const [toClass, setToClass] = useState("");
  const [toSection, setToSection] = useState("");
  const [selected, setSelected] = useState([]);
  const [localError, setLocalError] = useState("");

  const error = localError || studentError;
  const success = studentSuccess;

  useEffect(() => {
    dispatch(fetchMasterDataThunk());
    dispatch(clearStudentError());
    dispatch(clearStudentSuccess());
  }, [dispatch]);

  const uniqueClasses = [...new Set(classSections.map((cs) => cs.className))];

  const getSections = (className) =>
    classSections
      .filter((cs) => cs.className === className)
      .map((cs) => cs.sectionName);

  useEffect(() => {
    setFromSection("");
    setSelected([]);
  }, [fromClass]);

  useEffect(() => {
    if (!fromClass || !fromSection) {
      setSelected([]);
      return;
    }
    dispatch(fetchStudentsThunk({ className: fromClass, sectionName: fromSection }));
    setSelected([]);
  }, [dispatch, fromClass, fromSection]);

  useEffect(() => {
    setToSection("");
  }, [toClass]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === students.length) {
      setSelected([]);
    } else {
      setSelected(students.map((s) => s._id));
    }
  };

  const handlePromote = async () => {
    setLocalError("");
    dispatch(clearStudentError());
    dispatch(clearStudentSuccess());

    if (!fromClass || !fromSection) {
      setLocalError("Please select From Class and Section");
      return;
    }
    if (!toClass || !toSection) {
      setLocalError("Please select To Class and Section");
      return;
    }
    if (fromClass === toClass && fromSection === toSection) {
      setLocalError("Cannot promote student to same class and section");
      return;
    }
    if (selected.length === 0) {
      setLocalError("Please select at least one student");
      return;
    }

    const resultAction = await dispatch(
      promoteStudentsThunk({
        fromClass,
        fromSection,
        toClass,
        toSection,
        studentIds: selected,
      })
    );

    if (promoteStudentsThunk.fulfilled.match(resultAction)) {
      setSelected([]);
      // Refresh student list
      dispatch(fetchStudentsThunk({ className: fromClass, sectionName: fromSection }));
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promotion</h1>
        <p className="text-sm text-gray-500">
          Promote students to the next academic class.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-100 text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={fromClass}
            onChange={(e) => setFromClass(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          >
            <option value="">From Class</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={fromSection}
            onChange={(e) => setFromSection(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
            disabled={!fromClass}
          >
            <option value="">From Section</option>
            {getSections(fromClass).map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          <select
            value={toClass}
            onChange={(e) => setToClass(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
          >
            <option value="">To Class</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={toSection}
            onChange={(e) => setToSection(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
            disabled={!toClass}
          >
            <option value="">To Section</option>
            {getSections(toClass).map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handlePromote}
            disabled={promoting}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {promoting ? "Promoting..." : "Promote"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center text-gray-500 py-8">Loading students...</div>
      )}

      {!loading && fromClass && fromSection && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Students — {fromClass} - {fromSection}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({students.length} found, {selected.length} selected)
              </span>
            </h2>
          </div>

          {students.length === 0 ? (
            <p className="text-gray-500 text-sm">No students found in this class/section.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === students.length && students.length > 0}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Student Name</th>
                    <th className="p-3 text-left">Roll Number</th>
                    <th className="p-3 text-left">Admission No</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`border-b hover:bg-gray-50 ${
                        selected.includes(student._id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(student._id)}
                          onChange={() => toggleSelect(student._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="p-3">{student.rollNumber}</td>
                      <td className="p-3">{student.admissionNumber}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Promotion;

import React, { useState,useEffect} from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

import {
 getAcademicYears,
 createAcademicYear,
 updateAcademicYear,
 deleteAcademicYear,
 setCurrentAcademicYear,
} from "../../../services/academicYearServices";

export default function AcademicYears() {
  const [academicYears, setAcademicYears] = useState([]);

  const [currentYear, setCurrentYear] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fetchAcademicYears = async () => {
  try {

    const response =
      await getAcademicYears();

    const years = response.data.data || [];
    setAcademicYears(years);
    const current = years.find((y) => y.isCurrent);
    if (current) {
      setCurrentYear(current.name);
    } else if (years.length > 0) {
      setCurrentYear(years[0].name);
    }

  } catch (error) {

  console.log(error);

  setError(
    error?.response?.data?.message ||
    "Failed to load Academic Years"
  );

}
};
useEffect(() => {
  fetchAcademicYears();
}, []);

  const handleAddYear = async () => {

  try {

    setError("");
    setSuccessMessage("");

    if (!startDate || !endDate) {

      setError(
        "Please select both dates"
      );

      return;
    }

    const startYear =
      new Date(startDate).getFullYear();

    const endYear =
      new Date(endDate).getFullYear();

    const academicYearName =
      `${startYear}-${String(endYear).slice(-2)}`;

    if (editId) {

      const response =
        await updateAcademicYear(
        editId,
        {
          name: academicYearName,
          startDate,
          endDate,
        }
      );

      setSuccessMessage(
        response.data.message
      );

    } else {

      const response =
        await createAcademicYear({
        name: academicYearName,
        startDate,
        endDate,
      });

      setSuccessMessage(
        response.data.message
      );

    }

    await fetchAcademicYears();

    setCurrentYear(
      academicYearName
    );

    setEditId(null);

    setStartDate("");

    setEndDate("");

    setTimeout(() => {
      setShowModal(false);
      setSuccessMessage("");
    }, 1500);

  } catch (error) {

    console.log(error);

    setError(
      error?.response?.data?.message ||
      "Something went wrong"
    );

  }

};
const handleDelete = async (id) => {

  try {

    setError("");
    setSuccessMessage("");

    const response =
      await deleteAcademicYear(id);

    await fetchAcademicYears();

    setSuccessMessage(
      response.data.message
    );

  } catch (error) {

    console.log(error);

    setError(
      error?.response?.data?.message ||
      "Failed to delete Academic Year"
    );

  }

};
const handleEdit = (year) => {

  try {

    setError("");
    setSuccessMessage("");

    if (!year) {

      setError(
        "Academic Year data not found"
      );

      return;
    }

    setEditId(year._id);

    setStartDate(
      year.startDate?.split("T")[0] || ""
    );

    setEndDate(
      year.endDate?.split("T")[0] || ""
    );

    setShowModal(true);

  } catch (error) {

    console.log(error);

    setError(
      "Failed to load Academic Year data"
    );

  }

};

  return (
    <div className="bg-white p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-1">Academic Years</h2>

      {error && !showModal && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600">
          {error}
        </div>
      )}

      {successMessage && !showModal && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700">
          {successMessage}
        </div>
      )}

      {/* Top Section */}
      <div className="grid lg:grid-cols-2 gap-3 mb-4">
        {/* Info Box */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-base mb-2">
            School session & current year
          </h3>

          <p className="text-gray-600 text-sm">
            Add each academic session (e.g. April 2025 to March 2026),
            then pick the current year.
          </p>

          <p className="text-blue-600 text-sm mt-3">
            Configure this before other masters.
          </p>
        </div>

        {/* Right Side */}
        <div className="p-4">
          <label className="text-xs text-gray-500 uppercase block mb-2">
            Current Academic Year
          </label>

          <div className="flex gap-3">
            <select
              value={currentYear}
              onChange={async (e) => {
                const selectedName = e.target.value;
                const selectedYear = academicYears.find((y) => y.name === selectedName);
                if (!selectedYear) return;
                try {
                  setError("");
                  setSuccessMessage("");
                  await setCurrentAcademicYear(selectedYear._id);
                  setCurrentYear(selectedName);
                  setSuccessMessage("Current academic year updated successfully");
                  await fetchAcademicYears();
                } catch (err) {
                  setError(err?.response?.data?.message || "Failed to update current year");
                }
              }}
              className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex-1 outline-none"
            >
              {academicYears.map((year) => (
                <option key={year._id} value={year.name}>
                  {year.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
               setEditId(null);

               setStartDate("");

               setEndDate("");

                setError("");

               setSuccessMessage("");

                 setShowModal(true);
             }}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg cursor-pointer"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-100 p-4 font-semibold rounded-lg">
          <div>#</div>
          <div>Academic Year</div>
          <div>Duration</div>
          <div className="text-right">Actions</div>
        </div>

        {academicYears.map((year, index) => (
          <div
            key={year._id}
            className="grid grid-cols-4 p-4 items-center"
          >
            <div>{index + 1}</div>

            <div>{year.name}</div>

            <div>
              <div>
           {year.startDate?.split("T")[0]} → {year.endDate?.split("T")[0]}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleEdit(year)}
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                <FaEdit />
              </button>

              <button
                onClick={() => handleDelete(year._id)}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editId ? "Edit Academic Year" : "Add Academic Year"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date <span className="text-red-500 ml-0.5">*</span>
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date <span className="text-red-500 ml-0.5">*</span>
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
                />
              </div>
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

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleAddYear}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg cursor-pointer"
              >
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

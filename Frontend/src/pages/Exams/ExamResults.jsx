import { useEffect, useState } from "react";
import { getExamResults } from "../../services/examService";
import { getSchoolProfile } from "../../services/schoolProfileService";

export default function ExamResults({ reportMode = false }) {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, passed: 0, failed: 0, passRate: 0 });
  const [error, setError] = useState("");
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    getExamResults()
      .then((response) => {
        setResults(response.data.data.results || []);
        setStats(response.data.data.stats || stats);
      })
      .catch((error) => setError(error?.response?.data?.message || "Failed to load exam results"));

    getSchoolProfile()
      .then((response) => {
        setSchoolInfo(response.data.data);
      })
      .catch((err) => console.error("Failed to load school profile", err));
  }, []);

  const exportResults = () => {
    const csv = [["Student Name", "Roll Number", "Percentage", "Result", "Grade"], ...results.map((item) => [`${item.student.firstName} ${item.student.lastName}`, item.student.rollNumber, item.percentage, item.result, item.grade])].map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = reportMode ? "report-cards.csv" : "exam-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {!reportMode && <div className="grid gap-4 sm:grid-cols-4"><Card label="Total Students" value={stats.totalStudents} /><Card label="Passed" value={stats.passed} /><Card label="Failed" value={stats.failed} /><Card label="Pass Rate" value={`${stats.passRate}%`} /></div>}
      {error && <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}
      <div className="rounded-2xl bg-white p-4 shadow-sm print:hidden">
        <div className="flex justify-end mb-4"><button onClick={exportResults} className="bg-blue-900 text-white px-6 py-2 rounded-lg">{reportMode ? "Download Report Card Data" : "Export"}</button></div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] bg-gray-100 p-4 font-semibold rounded-lg min-w-[760px]"><div>Student Name</div><div>Roll Number</div><div>Percentage</div><div>Result</div><div>{reportMode ? "Action" : "Grade"}</div></div>
          {results.map((item) => <div key={item.student._id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] p-4 items-center min-w-[760px]"><div>{item.student.firstName} {item.student.lastName}</div><div>{item.student.rollNumber}</div><div>{item.percentage}%</div><div>{item.result}</div><div>{reportMode ? <button onClick={() => setSelectedStudent(item)} className="text-blue-900 hover:underline font-semibold">View / Print</button> : item.grade}</div></div>)}
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative print:shadow-none print:p-0 print:m-0">
            {/* Modal Close / Print controls */}
            <div className="flex justify-end space-x-2 mb-4 print:hidden">
              <button onClick={handlePrint} className="bg-blue-900 text-white px-4 py-2 rounded-lg">Print / PDF</button>
              <button onClick={() => setSelectedStudent(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Close</button>
            </div>

            {/* Printable Report Card Area */}
            <div className="border border-gray-300 p-6 rounded-xl space-y-6 print:border-0 print:p-0">
              {/* School Header */}
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                {schoolInfo?.logo && (
                  <img src={schoolInfo.logo} alt="School Logo" className="w-16 h-16 object-contain" />
                )}
                <div>
                  <h1 className="text-xl font-bold text-blue-950 uppercase">{schoolInfo?.schoolName || "School Name"}</h1>
                  <p className="text-xs text-gray-500">{schoolInfo?.addressLine1}, {schoolInfo?.city}, {schoolInfo?.state} - {schoolInfo?.pincode}</p>
                  <p className="text-xs text-gray-500">Board: {schoolInfo?.boardAffiliation} | Established: {schoolInfo?.establishedYear}</p>
                  <p className="text-xs text-gray-500">Contact: {schoolInfo?.phone} | Email: {schoolInfo?.email}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800 tracking-wider uppercase">Academic Report Card</h2>
              </div>

              {/* Student info */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-gray-500">Student Name:</p>
                  <p className="font-semibold text-gray-800">{selectedStudent.student.firstName} {selectedStudent.student.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Roll Number:</p>
                  <p className="font-semibold text-gray-800">{selectedStudent.student.rollNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Class & Section:</p>
                  <p className="font-semibold text-gray-800">{selectedStudent.student.className} - {selectedStudent.student.sectionName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Academic Year:</p>
                  <p className="font-semibold text-gray-800">{schoolInfo?.academicYearId?.yearName || "Current"}</p>
                </div>
              </div>

              {/* Marks Table */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Exam Type</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Max Marks</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Obtained Marks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedStudent.subjects.map((subMark, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{subMark.subject}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-center">{subMark.examType}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-center">{subMark.maximumMarks}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-center font-medium">{subMark.obtainedMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Results summary footer */}
              <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4 text-center">
                <div>
                  <p className="text-gray-500 text-xs uppercase">Percentage</p>
                  <p className="text-xl font-bold text-blue-900">{selectedStudent.percentage}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase">Grade</p>
                  <p className="text-xl font-bold text-blue-900">{selectedStudent.grade}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase">Result</p>
                  <p className={`text-xl font-bold ${selectedStudent.result === "Pass" ? "text-green-600" : "text-red-600"}`}>{selectedStudent.result}</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between pt-10 text-xs text-gray-400">
                <div className="text-center border-t border-gray-200 w-28 pt-1">
                  Class Teacher
                </div>
                <div className="text-center border-t border-gray-200 w-28 pt-1">
                  Principal
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value }) { return <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><h2 className="mt-2 text-3xl font-bold">{value}</h2></div>; }

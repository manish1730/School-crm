import { useEffect, useState } from "react";
import { getExamResults } from "../../services/examService";

export default function ExamResults({ reportMode = false }) {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, passed: 0, failed: 0, passRate: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    getExamResults()
      .then((response) => {
        setResults(response.data.data.results || []);
        setStats(response.data.data.stats || stats);
      })
      .catch((error) => setError(error?.response?.data?.message || "Failed to load exam results"));
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

  return (
    <div className="space-y-4">
      {!reportMode && <div className="grid gap-4 sm:grid-cols-4"><Card label="Total Students" value={stats.totalStudents} /><Card label="Passed" value={stats.passed} /><Card label="Failed" value={stats.failed} /><Card label="Pass Rate" value={`${stats.passRate}%`} /></div>}
      {error && <div className="p-3 rounded-lg bg-red-100 text-red-600">{error}</div>}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex justify-end mb-4"><button onClick={exportResults} className="bg-blue-900 text-white px-6 py-2 rounded-lg">{reportMode ? "Download Report Card Data" : "Export"}</button></div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] bg-gray-100 p-4 font-semibold rounded-lg min-w-[760px]"><div>Student Name</div><div>Roll Number</div><div>Percentage</div><div>Result</div><div>{reportMode ? "Action" : "Grade"}</div></div>
          {results.map((item) => <div key={item.student._id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] p-4 items-center min-w-[760px]"><div>{item.student.firstName} {item.student.lastName}</div><div>{item.student.rollNumber}</div><div>{item.percentage}%</div><div>{item.result}</div><div>{reportMode ? "Download" : item.grade}</div></div>)}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }) { return <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><h2 className="mt-2 text-3xl font-bold">{value}</h2></div>; }

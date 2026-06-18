import { Outlet } from "react-router-dom";

const Exams = () => {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Exams</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Manage marks entry, results and report cards
        </p>
      </div>

      <Outlet />
    </div>
  );
};

export default Exams;

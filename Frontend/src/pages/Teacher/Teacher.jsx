import { Outlet } from "react-router-dom";

const Teacher = () => {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Staff</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Manage staff records, attendance, leave and payroll
        </p>
      </div>

      <Outlet />
    </div>
  );
};

export default Teacher;

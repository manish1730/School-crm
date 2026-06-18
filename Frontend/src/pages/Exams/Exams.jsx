import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { label: "Marks Entry", path: "Marks-Entry" },
  { label: "Exam Results", path: "Results" },
  { label: "Report Cards", path: "Report-Cards" },
];

const Exams = () => {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Exams</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Manage marks entry, results and report cards
        </p>
      </div>

      <div className="rounded-2xl bg-gray-100 p-2 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-4 py-2 text-sm sm:text-base transition-all ${
                  isActive ? "bg-white text-blue-900 shadow font-semibold" : "text-gray-600 hover:bg-gray-200"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default Exams;

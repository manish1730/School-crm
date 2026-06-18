import { useEffect, useState } from "react";
import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaCalendarAlt,
  FaMoneyBill,
  FaFileAlt,
  FaBus,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUserPlus,
} from "react-icons/fa";
import { NavLink, useLocation,useNavigate} from "react-router-dom";

import logo from "../assets/logo.png";

const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  const menu = [
    { icon: <FaHome />, name: "Dashboard", path: "/Dashboard" },
    {
      icon: <FaUserPlus />,
      name: "Admission",
      subRoutes: [
        { icon: <FaUserPlus />, name: "Enquiry", path: "/Admission/Enquiry" },
        { icon: <FaUserPlus />, name: "New Admission", path: "/Admission/New-Admission" },
      ],
    },
    { icon: <FaUserGraduate />, name: "Students", path: "/Student" },
    { icon: <FaChalkboardTeacher />, name: "Teachers", path: "/Teacher" },
    { icon: <FaClipboardCheck />, name: "Attendance", path: "/Attendence" },
    { icon: <FaCalendarAlt />, name: "Timetable", path: "/Timetable" },
    { icon: <FaMoneyBill />, name: "Fees & Finance", path: "/Fees" },
    { icon: <FaFileAlt />, name: "Exams", path: "/Exams" },
    { icon: <FaBus />, name: "Transport", path: "/Transport" },
    {
      icon: <FaCog />,
      name: "Settings",
      subRoutes: [
        { icon: <FaCog />, name: "Overview", path: "/Settings" },
        { icon: <FaCog />, name: "Audit Logs", path: "/Settings/Audit-Logs" },
        { icon: <FaCog />, name: "Integration", path: "/Settings/Integration" },
        { icon: <FaCog />, name: "Masters", path: "/Settings/Masters" },
        { icon: <FaCog />, name: "School Profile", path: "/Settings/School-Profile" },
      ],
    },
  ];
   const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Login");
  };
  return (
    <>
      <div className="hidden md:flex md:w-[280px] md:fixed md:left-0 md:top-0 md:h-screen md:min-h-screen bg-[#06123f] text-white p-5 flex-col overflow-y-auto">
        <SidebarContent menu={menu} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close sidebar overlay"
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <div className="relative z-50 h-full w-[280px] max-w-[85vw] bg-[#06123f] text-white p-4 flex flex-col overflow-y-auto shadow-2xl">
            <SidebarContent menu={menu} />
          </div>
        </div>
      ) : null}
    </>
  );
};

const SidebarContent = ({ menu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeDropdownIndex = menu.findIndex((item) =>
    item.subRoutes?.some((sub) => sub.path === location.pathname)
  );
  const [openDropdown, setOpenDropdown] = useState(
    activeDropdownIndex === -1 ? null : activeDropdownIndex
  );
  useEffect(() => {
    if (activeDropdownIndex !== -1) {
      setOpenDropdown(activeDropdownIndex);
    }
  }, [activeDropdownIndex]);
  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/Login");
};

  return (
    <>
      <div className="flex items-center gap-3 mb-8 md:mb-10">
        <img
          src={logo}
          alt="DEE Campus"
          className="w-12 h-12 md:w-14 md:h-14 object-contain"
        />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-400">DEE</h1>
          <h2 className="text-xl md:text-2xl font-bold text-cyan-400 -mt-1">Campus</h2>
        </div>
      </div>

      <div className="space-y-1 flex-1">
        {menu.map((item, index) =>
          item.subRoutes ? (
            <div key={index}>
              <button
                onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#0f215f] transition-all ${
                  item.subRoutes.some((sub) => sub.path === location.pathname)
                    ? "bg-[#0f215f]"
                    : ""
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1 text-left text-sm">{item.name}</span>
                {openDropdown === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {openDropdown === index && (
                <div className="ml-4 pl-3 border-l border-white/10 space-y-1 mt-1">
                  {item.subRoutes.map((sub, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={sub.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[#0f215f] hover:text-white transition-all ${
                          isActive ? "bg-[#0f215f] text-white" : "text-gray-400"
                        }`
                      }
                    >
                      <span>{sub.icon}</span>
                      <span>{sub.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={index}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? "bg-[#4f46e5]" : "hover:bg-[#0f215f]"
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </NavLink>
          )
        )}
      </div>

      <div className="bg-[#0d1d57] rounded-3xl p-4 mt-4 mb-2 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-[#1b2d78] flex items-center justify-center mb-4">
          📅
        </div>
        <p className="text-gray-300 text-xs md:text-sm tracking-wider">ACADEMIC YEAR</p>
        <h2 className="text-2xl md:text-3xl font-bold mt-2">2026-27</h2>
        <div className="flex items-center gap-2 mt-4">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-300">Active Session</span>
        </div>
      </div>
      <button
  onClick={handleLogout}
  className="w-full mt-3 flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition-all"
>
  <FaSignOutAlt />
  <span>Logout</span>
</button>
    </>
  );
};

export default Sidebar;

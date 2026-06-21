import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaBars,
  FaUserPlus,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaClipboardCheck,
  FaSearch,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

import logo from "../assets/logo.png";
import { globalSearch } from "../services/searchService";

// ---------- helpers ----------
const RESULT_CATEGORY_CONFIG = [
  {
    key: "students",
    label: "Students",
    getTitle: (r) => `${r.firstName} ${r.lastName}`,
    getSubtitle: (r) => r.admissionNumber || r.rollNumber || "",
    route: "/Student",
  },
  {
    key: "staff",
    label: "Staff",
    getTitle: (r) => r.fullName,
    getSubtitle: (r) => r.designation || r.department || "",
    route: "/Staff",
  },
  {
    key: "classes",
    label: "Classes",
    getTitle: (r) => `${r.className}${r.sectionName ? ` – ${r.sectionName}` : ""}`,
    getSubtitle: (r) => r.classCode || "",
    route: "/Setting/Masters/class-sections",
  },
  {
    key: "departments",
    label: "Departments",
    getTitle: (r) => r.departmentName,
    getSubtitle: (r) => r.departmentCode || "",
    route: "/Setting/Masters/departments",
  },
  {
    key: "subjects",
    label: "Subjects",
    getTitle: (r) => r.subjectName,
    getSubtitle: (r) => r.subjectCode || "",
    route: "/Setting/Masters/subjects",
  },
  {
    key: "academicYears",
    label: "Academic Years",
    getTitle: (r) => r.name,
    getSubtitle: (r) => (r.isCurrent ? "Current Year" : ""),
    route: "/Setting/Masters/academic-years",
  },
  {
    key: "fees",
    label: "Fee Records",
    getTitle: (r) =>
      r.studentId
        ? `${r.studentId.firstName} ${r.studentId.lastName}`
        : r.receiptNumber || "—",
    getSubtitle: (r) => `Receipt: ${r.receiptNumber || "—"}`,
    route: "/Fees",
  },
  {
    key: "exams",
    label: "Exams",
    getTitle: (r) =>
      r.studentId
        ? `${r.studentId.firstName} ${r.studentId.lastName}`
        : r.subject || "—",
    getSubtitle: (r) => `${r.subject || ""} – ${r.examType || ""}`,
    route: "/Exam",
  },
];

// ---------- SearchBar component (shared between mobile/desktop) ----------
const SearchBar = ({ className = "" }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim() || val.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await globalSearch(val.trim());
        setResults(res.data || null);
      } catch (err) {
        console.error("Search failed:", err);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  };

  const handleSelect = (route) => {
    navigate(route);
    setIsOpen(false);
    setQuery("");
    setResults(null);
  };

  // Compute whether any results exist
  const hasResults =
    results &&
    RESULT_CATEGORY_CONFIG.some(
      (cat) => results[cat.key] && results[cat.key].length > 0
    );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="flex items-center border rounded-full px-4 py-2.5 bg-gray-50 focus-within:bg-white focus-within:border-[#4f46e5] transition-all gap-2">
        {loading ? (
          <FaSpinner className="text-[#4f46e5] animate-spin flex-shrink-0" size={14} />
        ) : (
          <FaSearch className="text-gray-400 flex-shrink-0" size={14} />
        )}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (results && query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Search students, staff, fees..."
          className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[420px] overflow-y-auto">
          {loading && (
            <div className="px-5 py-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
              <FaSpinner className="animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {!loading && !hasResults && results !== null && (
            <div className="px-5 py-6 text-center text-sm text-gray-400">
              No results found for{" "}
              <span className="font-semibold text-gray-600">"{query}"</span>
            </div>
          )}

          {!loading &&
            hasResults &&
            RESULT_CATEGORY_CONFIG.map((cat) => {
              const items = results[cat.key];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat.key}>
                  {/* Category header */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {cat.label}
                    </span>
                  </div>
                  {/* Items */}
                  {items.map((item, idx) => (
                    <button
                      key={item._id || idx}
                      type="button"
                      onClick={() => handleSelect(cat.route)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#4f46e5]/5 text-left transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#4f46e5]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FaSearch size={10} className="text-[#4f46e5]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {cat.getTitle(item)}
                        </p>
                        {cat.getSubtitle(item) && (
                          <p className="text-xs text-gray-400 truncate">
                            {cat.getSubtitle(item)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

// ---------- Main Navbar ----------
const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const quickActions = [
    {
      title: "New Admission",
      icon: <FaUserPlus className="text-blue-600" />,
      route: "/Admission/New-Admission",
    },
    {
      title: "Collect Fee",
      icon: <FaMoneyBillWave className="text-green-600" />,
      route: "/Fees",
    },
    {
      title: "Add Enquiry",
      icon: <FaPhoneAlt className="text-orange-500" />,
      route: "/Student",
    },
    {
      title: "Mark Attendance",
      icon: <FaClipboardCheck className="text-purple-600" />,
      route: "/Attendence",
    },
  ];

  return (
    <>
      {/* ---- MOBILE NAVBAR ---- */}
      <div className="md:hidden bg-white rounded-3xl px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700"
            aria-label="Open menu"
          >
            <FaBars />
          </button>

          <img src={logo} alt="DEE Campus" className="w-10 h-10 object-contain" />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-[#4f46e5] text-white px-3 py-2 h-10 rounded-full text-sm font-medium whitespace-nowrap"
            >
              + Quick Create
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 w-[260px] bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-700">Quick Actions</h3>
                </div>

                {quickActions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.route);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 text-left"
                  >
                    {item.icon}
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <img
            src="https://i.pravatar.cc/50"
            alt="User avatar"
            className="rounded-full w-9 h-9"
          />
        </div>
      </div>

      {/* ---- DESKTOP NAVBAR ---- */}
      <div className="hidden md:flex bg-white p-4 lg:p-5 rounded-3xl flex-col xl:flex-row gap-4 xl:gap-0 justify-between xl:items-center shadow-sm">
        {/* Search Bar */}
        <SearchBar className="w-full xl:w-[500px]" />

        <div className="flex flex-wrap gap-5 items-center justify-between xl:justify-end">
          <FaBell size={22} />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-[#4f46e5] text-white px-6 py-3 rounded-full"
            >
              + Quick Create
            </button>

            {showMenu && (
              <div className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-gray-700">Quick Actions</h3>
                </div>

                {quickActions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.route);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 text-left"
                  >
                    {item.icon}
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <img
            src="https://i.pravatar.cc/50"
            alt="User avatar"
            className="rounded-full w-10 h-10"
          />
        </div>
      </div>
    </>
  );
};

export default Navbar;

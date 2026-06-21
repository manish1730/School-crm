import { useState } from "react";
import MasterCrudPage from "../../../components/masters/MasterCrudPage";
import { academicCalendarService } from "../../../services/masterSetupServices";

const eventTypes = [
  "Holiday",
  "Examination",
  "Activity",
  "Meeting",
  "Function",
];

const fields = [
  { name: "eventTitle", label: "Event Title", required: true },
  {
    name: "eventType",
    label: "Event Type",
    type: "select",
    options: eventTypes.map((type) => ({
      label: type,
      value: type,
    })),
    required: true,
  },
  { name: "startDate", label: "Start Date", type: "date", required: true },
  { name: "endDate", label: "End Date", type: "date", required: true },
  { name: "description", label: "Description", type: "textarea" },
];

const columns = [
  { key: "eventTitle", label: "Event Title" },
  { key: "eventType", label: "Type" },
  {
    key: "startDate",
    label: "Start Date",
    render: (record) => record.startDate?.split("T")[0],
  },
  {
    key: "endDate",
    label: "End Date",
    render: (record) => record.endDate?.split("T")[0],
  },
  { key: "description", label: "Description" },
];

const validate = ({
  eventTitle,
  eventType,
  startDate,
  endDate,
}) => {
  if (!eventTitle) return "Event Title is required";
  if (!eventType) return "Event Type is required";
  if (!startDate) return "Start Date is required";
  if (!endDate) return "End Date is required";
  if (new Date(startDate) >= new Date(endDate)) {
    return "Start Date must be before End Date";
  }
  return null;
};

export default function AcademicCalendar() {
  const [view, setView] = useState("table");

  return (
    <MasterCrudPage
      title="Academic Calendar"
      description="Manage school events, holidays, examinations and important dates."
      entityName="Academic Calendar Event"
      service={academicCalendarService}
      fields={fields}
      columns={columns}
      validate={validate}
      transformRecord={(record) => ({
        eventTitle: record.eventTitle || "",
        eventType: record.eventType || "",
        startDate: record.startDate?.split("T")[0] || "",
        endDate: record.endDate?.split("T")[0] || "",
        description: record.description || "",
      })}
    >
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setView("table")}
          className={`px-4 py-2 rounded-lg ${
            view === "table" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          Table View
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`px-4 py-2 rounded-lg ${
            view === "calendar" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          Calendar View
        </button>
      </div>

      {view === "calendar" && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {eventTypes.map((type) => (
            <div key={type} className="bg-gray-100 rounded-lg p-3 text-center">
              <p className="font-semibold text-sm">{type}</p>
              <p className="text-xs text-gray-500 mt-1">Use search to filter</p>
            </div>
          ))}
        </div>
      )}
    </MasterCrudPage>
  );
}

const AcademicInfo = ({ formData, classSections, sections, onChange, next, prev }) => {
  const classes = [...new Set(classSections.map((item) => item.className))];

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">Academic Information</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-5">
        <div>
          <label className="mb-2 block font-medium">Class</label>
          <select
            value={formData.className}
            onChange={(event) => onChange("className", event.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Class</option>
            {classes.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">Section</label>
          <select
            value={formData.sectionName}
            onChange={(event) => onChange("sectionName", event.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Section</option>
            {sections.map((sectionName) => (
              <option key={sectionName} value={sectionName}>{sectionName}</option>
            ))}
          </select>
        </div>

        <Input label="Admission Date" type="date" value={formData.admissionDate} onChange={(value) => onChange("admissionDate", value)} />
        <Input label="Roll Number" value={formData.rollNumber} onChange={(value) => onChange("rollNumber", value)} />

        <div className="md:col-span-2">
          <Input label="Previous School" value={formData.previousSchool} onChange={(value) => onChange("previousSchool", value)} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button onClick={prev} className="rounded-lg border border-slate-300 px-5 py-3">
          ← Previous
        </button>
        <button onClick={next} className="rounded-lg bg-blue-600 px-5 py-3 text-white">
          Next →
        </button>
      </div>
    </div>
  );
};

export default AcademicInfo;

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}

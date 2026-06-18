const GuardianInfo = ({ formData, onChange, next, prev }) => {
  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-semibold">Guardian Details</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-5">
        <Input label="Father Name" value={formData.fatherName} onChange={(value) => onChange("fatherName", value)} />
        <Input label="Father Phone" value={formData.fatherPhone} onChange={(value) => onChange("fatherPhone", value)} />
        <Input label="Father Email" value={formData.fatherEmail} onChange={(value) => onChange("fatherEmail", value)} />
        <Input label="Father Occupation" value={formData.fatherOccupation} onChange={(value) => onChange("fatherOccupation", value)} />
        <Input label="Mother Name" value={formData.motherName} onChange={(value) => onChange("motherName", value)} />
        <Input label="Mother Phone" value={formData.motherPhone} onChange={(value) => onChange("motherPhone", value)} />
        <Input label="Mother Occupation" value={formData.motherOccupation} onChange={(value) => onChange("motherOccupation", value)} />
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

export default GuardianInfo;

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block font-medium">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}

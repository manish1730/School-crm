const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PersonalInfo = ({ formData, categories, onChange, next }) => {
  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-semibold">Personal Information</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-5">
        <Input required label="First Name" value={formData.firstName} onChange={(value) => onChange("firstName", value)} />
        <Input required label="Last Name" value={formData.lastName} onChange={(value) => onChange("lastName", value)} />
        <Input required label="DOB" type="date" value={formData.dob} onChange={(value) => onChange("dob", value)} />
        <Select
          required
          label="Gender"
          value={formData.gender}
          options={["Male", "Female", "Other"]}
          onChange={(value) => onChange("gender", value)}
        />
        <Select
          label="Blood Group"
          value={formData.bloodGroup}
          options={bloodGroups}
          onChange={(value) => onChange("bloodGroup", value)}
        />
        <Input label="Religion" value={formData.religion} onChange={(value) => onChange("religion", value)} />
        <Select
          required
          label="Category"
          value={formData.category}
          options={categories.map((category) => category.categoryName)}
          onChange={(value) => onChange("category", value)}
        />
        <Input required label="Aadhaar Number" value={formData.aadhaarNumber} onChange={(value) => onChange("aadhaarNumber", value)} />
        <Input required label="Phone Number" value={formData.phoneNumber} onChange={(value) => onChange("phoneNumber", value)} />
        <Input label="Email" value={formData.email} onChange={(value) => onChange("email", value)} />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Address <span className="text-red-500 ml-0.5">*</span>
        </label>
        <textarea
          value={formData.address}
          onChange={(event) => onChange("address", event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <button onClick={next} className="rounded-lg bg-blue-600 px-6 py-3 text-white cursor-pointer">
          Next →
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="mb-2 block font-medium">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}

function Select({ label, value, options, onChange, required }) {
  return (
    <div>
      <label className="mb-2 block font-medium">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 cursor-pointer"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

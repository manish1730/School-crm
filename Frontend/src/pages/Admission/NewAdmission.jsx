import { useEffect, useMemo, useState } from "react";

import PersonalInfo from "./PersonalInfo";
import GuardianInfo from "./GuardianInfo";
import AcademicInfo from "./AcademicInfo";
import Documents from "./Documents";
import {
  categoryService,
  classSectionService,
} from "../../services/masterSetupServices";
import { createStudent } from "../../services/studentService";

const initialForm = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  religion: "",
  category: "",
  aadhaarNumber: "",
  phoneNumber: "",
  email: "",
  address: "",
  fatherName: "",
  fatherPhone: "",
  fatherEmail: "",
  fatherOccupation: "",
  motherName: "",
  motherPhone: "",
  motherOccupation: "",
  className: "",
  sectionName: "",
  rollNumber: "",
  admissionDate: "",
  previousSchool: "",
  documents: {
    aadhaar: "",
    birthCertificate: "",
    studentPhoto: "",
    transferCertificate: "",
    reportCard: "",
    otherDocuments: "",
  },
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validations = {
  1: (formData) => {
    if (!formData.firstName || formData.firstName.trim().length < 2) return "First Name is required";
    if (!formData.lastName) return "Last Name is required";
    if (!formData.dob) return "DOB is required";
    if (new Date(formData.dob) > new Date()) return "DOB cannot be future date";
    if (!formData.gender) return "Gender is required";
    if (!formData.category) return "Category is required";
    if (!/^\d{12}$/.test(formData.aadhaarNumber)) return "Aadhaar Number must be exactly 12 digits";
    if (!/^\d{10}$/.test(formData.phoneNumber)) return "Phone Number must be exactly 10 digits";
    if (formData.email && !emailRegex.test(formData.email)) return "Email must be valid";
    if (!formData.address) return "Address is required";
    return null;
  },
  2: (formData) => {
    if (!formData.fatherName) return "Father Name is required";
    if (!/^\d{10}$/.test(formData.fatherPhone)) return "Father Phone must be exactly 10 digits";
    if (formData.fatherEmail && !emailRegex.test(formData.fatherEmail)) return "Father Email must be valid";
    if (!formData.motherName) return "Mother Name is required";
    if (formData.motherPhone && !/^\d{10}$/.test(formData.motherPhone)) return "Mother Phone must be exactly 10 digits";
    return null;
  },
  3: (formData) => {
    if (!formData.className) return "Class is required";
    if (!formData.sectionName) return "Section is required";
    if (!formData.rollNumber) return "Roll Number is required";
    if (!formData.admissionDate) return "Admission Date is required";
    if (new Date(formData.admissionDate) > new Date()) return "Admission Date cannot be future date";
    return null;
  },
};

const NewAdmission = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [classSections, setClassSections] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMasters = async () => {
      const [categoryResponse, classResponse] = await Promise.all([
        categoryService.getAll(),
        classSectionService.getAll(),
      ]);

      setCategories(categoryResponse.data.data || []);
      setClassSections(classResponse.data.data || []);
    };

    fetchMasters().catch(() => {
      setError("Failed to load Master Setup dropdowns");
    });
  }, []);

  const sections = useMemo(
    () =>
      classSections
        .filter((item) => item.className === formData.className)
        .map((item) => item.sectionName),
    [classSections, formData.className]
  );

  const handleChange = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "className" ? { sectionName: "" } : {}),
    }));
  };

  const handleDocumentChange = (name, file) => {
    setFormData((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [name]: file?.name || "",
      },
    }));
  };

  const goNext = () => {
    const validationMessage = validations[step]?.(formData);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError("");
    setStep((current) => current + 1);
  };

  const submitAdmission = async () => {
    try {
      setError("");
      setSuccessMessage("");

      for (const key of [1, 2, 3]) {
        const validationMessage = validations[key](formData);
        if (validationMessage) {
          setError(validationMessage);
          setStep(Number(key));
          return;
        }
      }

      setLoading(true);
      const response = await createStudent(formData);

      setSuccessMessage(response.data.message);
      setFormData(initialForm);
      setStep(1);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to submit admission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">New Admission</h1>
        <p className="text-sm sm:text-base text-gray-500">
          Complete the admission form to enroll a new student
        </p>
      </div>

      <div className="rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StepItem number={1} title="Personal Info" active={step >= 1} />
          <StepItem number={2} title="Guardian Details" active={step >= 2} />
          <StepItem number={3} title="Academic Info" active={step >= 3} />
          <StepItem number={4} title="Documents" active={step >= 4} />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-100 text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-green-100 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
        {step === 1 && (
          <PersonalInfo
            formData={formData}
            categories={categories}
            onChange={handleChange}
            next={goNext}
          />
        )}
        {step === 2 && (
          <GuardianInfo
            formData={formData}
            onChange={handleChange}
            next={goNext}
            prev={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <AcademicInfo
            formData={formData}
            classSections={classSections}
            sections={sections}
            onChange={handleChange}
            next={goNext}
            prev={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Documents
            formData={formData}
            onDocumentChange={handleDocumentChange}
            submitAdmission={submitAdmission}
            loading={loading}
            prev={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
};

export default NewAdmission;

const StepItem = ({ number, title, active }) => (
  <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${active ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-white"}`}>
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${
        active ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      {number}
    </div>
    <span className="text-sm sm:text-base font-medium text-slate-700">{title}</span>
  </div>
);

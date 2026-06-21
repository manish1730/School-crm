import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import {
  getSchoolProfile,
  createSchoolProfile,
  updateSchoolProfile,
} from "../../services/schoolProfileService";
import FeeToast from "../../components/FeeToast";
import { useAppDispatch } from "../../redux/hooks";
import { fetchMasterDataThunk } from "../../redux/features/master/masterSlice";
import { fetchSchoolProfileThunk } from "../../redux/features/settings/settingsSlice";

export default function SchoolProfile() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    schoolName: "",
    shortName: "",
    establishedYear: "",
    boardAffiliation: "",
    schoolType: "",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    chairman: "",
    principal: "",
    vicePrincipal: "",
    adminHead: "",
    logo: "",
    banner: "",
    favicon: "",
    academicYearId: "",
    sessionStatus: "Active",
    attendanceEnabled: false,
    feeManagementEnabled: false,
    examEnabled: false,
    transportEnabled: false,
    smsNotificationsEnabled: false,
    emailNotificationsEnabled: false,
  });

  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Fetch init data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch profile
        const profileRes = await getSchoolProfile();
        const profile = profileRes.data.data;

        if (profile && profile._id) {
          setProfileId(profile._id);
          setFormData({
            schoolName: profile.schoolName || "",
            shortName: profile.shortName || "",
            establishedYear: profile.establishedYear || "",
            boardAffiliation: profile.boardAffiliation || "",
            schoolType: profile.schoolType || "",
            email: profile.email || "",
            phone: profile.phone || "",
            alternatePhone: profile.alternatePhone || "",
            website: profile.website || "",
            addressLine1: profile.addressLine1 || "",
            addressLine2: profile.addressLine2 || "",
            city: profile.city || "",
            state: profile.state || "",
            country: profile.country || "",
            pincode: profile.pincode || "",
            chairman: profile.chairman || "",
            principal: profile.principal || "",
            vicePrincipal: profile.vicePrincipal || "",
            adminHead: profile.adminHead || "",
            logo: profile.logo || "",
            banner: profile.banner || "",
            favicon: profile.favicon || "",
            academicYearId: profile.academicYearId?._id || profile.academicYearId || "",
            sessionStatus: profile.sessionStatus || "Active",
            attendanceEnabled: profile.attendanceEnabled || false,
            feeManagementEnabled: profile.feeManagementEnabled || false,
            examEnabled: profile.examEnabled || false,
            transportEnabled: profile.transportEnabled || false,
            smsNotificationsEnabled: profile.smsNotificationsEnabled || false,
            emailNotificationsEnabled: profile.emailNotificationsEnabled || false,
          });
        }
      } catch (error) {
        console.error(error);
        showToast(
          error?.response?.data?.message || "Failed to load School Profile settings",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Frontend Validations
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
    const lettersOnlyRegex = /^[A-Za-z\s]+$/;

    // Required checks
    if (!formData.schoolName.trim()) return "School Name is required";
    if (formData.schoolName.trim().length < 3) return "School Name must be at least 3 characters";
    if (!formData.shortName.trim()) return "Short Name is required";
    if (formData.shortName.trim().length < 2) return "Short Name must be at least 2 characters";
    if (!formData.establishedYear) return "Established Year is required";
    
    const year = Number(formData.establishedYear);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      return "Established Year must be between 1900 and current year";
    }

    if (!formData.boardAffiliation) return "Board Affiliation is required";
    if (!formData.schoolType) return "School Type is required";
    
    // Email Check
    if (!formData.email.trim()) return "Valid Email Is Required";
    if (!emailRegex.test(formData.email.trim())) return "Valid Email Is Required";

    // Phone Check
    if (!formData.phone.trim()) return "Phone Number Must Be 10 Digits";
    if (!/^\d{10}$/.test(formData.phone.trim())) return "Phone Number Must Be 10 Digits";

    // Alternate Phone (Optional)
    if (formData.alternatePhone.trim() && !/^\d{10}$/.test(formData.alternatePhone.trim())) {
      return "Phone Number Must Be 10 Digits";
    }

    // Website (Optional)
    let websiteValue = formData.website.trim();
    if (websiteValue) {
      if (!/^https?:\/\//i.test(websiteValue)) {
        websiteValue = `https://${websiteValue}`;
      }
      const urlRegexForTest = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;
      if (!urlRegexForTest.test(websiteValue)) {
        return "Invalid Website URL";
      }
    }

    // Address
    if (!formData.addressLine1.trim()) return "Address Line 1 is required";
    
    // Letters-only for City, State, Country
    if (!formData.city.trim()) return "City is required";
    if (!lettersOnlyRegex.test(formData.city.trim())) return "City must contain letters only";

    if (!formData.state.trim()) return "State is required";
    if (!lettersOnlyRegex.test(formData.state.trim())) return "State must contain letters only";

    if (!formData.country.trim()) return "Country is required";
    if (!lettersOnlyRegex.test(formData.country.trim())) return "Country must contain letters only";

    // Pincode (6 digits)
    if (!formData.pincode.trim()) return "Pincode is required";
    if (!/^\d{6}$/.test(formData.pincode.trim())) return "Pincode must be exactly 6 digits";

    // Management
    if (!formData.chairman.trim()) return "Chairman Name is required";
    if (formData.chairman.trim().length < 3) return "Chairman Name must be at least 3 characters";

    if (!formData.principal.trim()) return "Principal Name is required";
    if (formData.principal.trim().length < 3) return "Principal Name must be at least 3 characters";

    if (formData.vicePrincipal.trim() && formData.vicePrincipal.trim().length < 3) {
      return "Vice Principal Name must be at least 3 characters";
    }

    if (!formData.adminHead.trim()) return "Admin Head Name is required";
    if (formData.adminHead.trim().length < 3) return "Admin Head Name must be at least 3 characters";

    // Academic Settings
    if (!formData.sessionStatus) return "Session Status is required";

    return null;
  };

  // 1. handleSaveProfile (Create Profile)
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      showToast(errorMsg, "error");
      return;
    }

    try {
      setSubmitting(true);
      
      let websiteValue = formData.website.trim();
      if (websiteValue && !/^https?:\/\//i.test(websiteValue)) {
        websiteValue = `https://${websiteValue}`;
      }

      // Uppercase shortName
      const payload = {
        ...formData,
        website: websiteValue,
        shortName: formData.shortName.toUpperCase(),
      };

      const res = await createSchoolProfile(payload);
      setProfileId(res.data.data._id);
      // Sync Redux state so sidebar academic year and settings update instantly
      dispatch(fetchMasterDataThunk());
      dispatch(fetchSchoolProfileThunk());
      showToast("School Profile Created Successfully", "success");
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message || "Failed to create School Profile",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 2. handleUpdateProfile (Update Profile)
  const handleUpdateProfile = async (e) => {
    e?.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      showToast(errorMsg, "error");
      return;
    }

    try {
      setSubmitting(true);
      
      let websiteValue = formData.website.trim();
      if (websiteValue && !/^https?:\/\//i.test(websiteValue)) {
        websiteValue = `https://${websiteValue}`;
      }

      const payload = {
        ...formData,
        website: websiteValue,
        shortName: formData.shortName.toUpperCase(),
      };

      await updateSchoolProfile(profileId, payload);
      // Sync Redux state so sidebar academic year and settings update instantly
      dispatch(fetchMasterDataThunk());
      dispatch(fetchSchoolProfileThunk());
      showToast("School Profile Updated Successfully", "success");
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message || "Failed to update School Profile",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <FaSpinner className="h-8 w-8 animate-spin text-blue-900" />
        <span className="ml-3 text-lg font-medium text-gray-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      {toast && <FeeToast toast={toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">School Profile</h1>
          <p className="text-sm text-gray-500 md:text-base">
            Manage school-level information, branding, and system configurations
          </p>
        </div>
      </div>

      <form onSubmit={profileId ? handleUpdateProfile : handleSaveProfile} className="space-y-6">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">1. Basic Information</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter School Name"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Short Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DEE"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Established Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 2005"
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Board Affiliation <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.boardAffiliation}
                onChange={(e) => setFormData({ ...formData, boardAffiliation: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              >
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="PSEB">PSEB</option>
                <option value="State Board">State Board</option>
                <option value="IB">IB</option>
                <option value="Cambridge">Cambridge</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                School Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.schoolType}
                onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              >
                <option value="">Select Type</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Semi-Government">Semi-Government</option>
                <option value="International">International</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT DETAILS */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">2. Contact Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Official Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="school@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Alternate Phone
              </label>
              <input
                type="text"
                placeholder="Optional 10-digit"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Website
              </label>
              <input
                type="text"
                placeholder="https://school.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Street address, P.O. box"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Address Line 2
              </label>
              <input
                type="text"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: MANAGEMENT DETAILS */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">3. Management Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Chairman Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Chairman Name"
                value={formData.chairman}
                onChange={(e) => setFormData({ ...formData, chairman: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Principal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Principal Name"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Vice Principal Name
              </label>
              <input
                type="text"
                placeholder="Vice Principal Name"
                value={formData.vicePrincipal}
                onChange={(e) => setFormData({ ...formData, vicePrincipal: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase">
                Admin Head Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Admin Head Name"
                value={formData.adminHead}
                onChange={(e) => setFormData({ ...formData, adminHead: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-8 py-3 text-base font-bold text-white shadow transition-all hover:bg-blue-800 disabled:bg-gray-400 cursor-pointer"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaCheckCircle />
                <span>{profileId ? "Update School Profile" : "Save School Profile"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

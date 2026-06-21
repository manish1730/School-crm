import { useEffect, useState } from "react";
import MasterCrudPage from "../../components/masters/MasterCrudPage";
import { selectDepartments, selectDesignations } from "../../redux/features/master/masterSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchStaffThunk,
  createStaffThunk,
  updateStaffThunk,
  deleteStaffThunk,
} from "../../redux/features/staff/staffSlice";

const erpRoles = ["Teacher", "Accountant", "Admin", "Receptionist", "Transport Manager"];

const columns = [
  { key: "employeeId", label: "Employee ID" },
  { key: "fullName", label: "Name" },
  { key: "department", label: "Department" },
  { key: "designation", label: "Designation" },
  { key: "phone", label: "Phone" },
  { key: "monthlySalary", label: "Salary" },
];

const validate = ({ fullName, email, phone, dob, gender, department, designation, erpRole, experience, accountNumber, ifscCode, monthlySalary, panNumber, address }) => {
  if (!fullName) return "Full Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) return "Email must be valid";
  if (!/^\d{10}$/.test(phone || "")) return "Phone must be exactly 10 digits";
  if (!dob) return "DOB is required";
  if (!gender) return "Gender is required";
  if (!department) return "Department is required";
  if (!designation) return "Designation is required";
  if (!erpRole) return "ERP Role is required";
  if (experience !== "" && Number.isNaN(Number(experience))) return "Experience must be numeric only";
  if (accountNumber && !/^\d+$/.test(accountNumber)) return "Account Number must be numeric";
  if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) return "IFSC Code must be valid";
  if (Number(monthlySalary || 0) < 0) return "Monthly Salary must be greater than or equal to 0";
  if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) return "PAN Number must be valid";
  if (!address) return "Address is required";
  return null;
};

export default function AllStaff() {
  const dispatch = useAppDispatch();
  const { list: staffList, loading, error } = useAppSelector((state) => state.staff);

  const rawDepartments = useAppSelector(selectDepartments);
  const rawDesignations = useAppSelector(selectDesignations);

  const departmentOptions = rawDepartments.map(item => ({ label: item.departmentName, value: item.departmentName }));
  const designationOptions = rawDesignations.map(item => ({ label: item.designationName, value: item.designationName }));

  const fields = [
    { name: "fullName", label: "Full Name" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    { name: "dob", label: "DOB", type: "date" },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"].map((item) => ({ label: item, value: item })) },
    { name: "department", label: "Department", type: "select", options: departmentOptions },
    { name: "designation", label: "Designation", type: "select", options: designationOptions },
    { name: "erpRole", label: "ERP Role", type: "select", options: erpRoles.map((item) => ({ label: item, value: item })) },
    { name: "qualification", label: "Qualification" },
    { name: "experience", label: "Experience", type: "number" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "bankName", label: "Bank Name" },
    { name: "accountNumber", label: "Account Number" },
    { name: "ifscCode", label: "IFSC Code" },
    { name: "monthlySalary", label: "Monthly Salary", type: "number" },
    { name: "panNumber", label: "PAN Number" },
  ];

  return (
    <MasterCrudPage
      title="All Staff"
      description="Create and manage staff profiles."
      entityName="Staff"
      reduxRecords={staffList}
      reduxLoading={loading}
      reduxError={error}
      onFetchRedux={(params) => dispatch(fetchStaffThunk(params))}
      onSaveRedux={async (id, payload) => {
        if (id) {
          await dispatch(updateStaffThunk({ id, data: payload }));
        } else {
          await dispatch(createStaffThunk(payload));
        }
      }}
      onDeleteRedux={async (id) => {
        await dispatch(deleteStaffThunk(id));
      }}
      fields={fields}
      columns={columns}
      validate={validate}
      buildPayload={(formData) => ({
        ...formData,
        experience: Number(formData.experience || 0),
        monthlySalary: Number(formData.monthlySalary || 0),
      })}
      transformRecord={(record) => ({
        fullName: record.fullName || "",
        email: record.email || "",
        phone: record.phone || "",
        dob: record.dob?.split("T")[0] || "",
        gender: record.gender || "",
        department: record.department || "",
        designation: record.designation || "",
        erpRole: record.erpRole || "",
        qualification: record.qualification || "",
        experience: record.experience ?? "",
        address: record.address || "",
        bankName: record.bankName || "",
        accountNumber: record.accountNumber || "",
        ifscCode: record.ifscCode || "",
        monthlySalary: record.monthlySalary ?? "",
        panNumber: record.panNumber || "",
      })}
    />
  );
}

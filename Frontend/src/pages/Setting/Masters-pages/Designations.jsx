import { useEffect, useState } from "react";
import MasterCrudPage from "../../../components/masters/MasterCrudPage";
import {
  departmentService,
  designationService,
} from "../../../services/masterSetupServices";

const columns = [
  { key: "designationName", label: "Designation Name" },
  { key: "designationCode", label: "Designation Code" },
  { key: "department", label: "Department" },
  { key: "description", label: "Description" },
];

const validate = ({
  designationName,
  designationCode,
  department,
}) => {
  if (!designationName) return "Designation Name is required";
  if (!designationCode) return "Designation Code is required";
  if (!department) return "Department is required";
  return null;
};

export default function Designations() {
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    departmentService
      .getAll()
      .then((response) => {
        setDepartmentOptions(
          (response.data.data || []).map((item) => ({
            label: item.departmentName,
            value: item.departmentName,
          }))
        );
      })
      .catch(() => setDepartmentOptions([]));
  }, []);

  const fields = [
    { name: "designationName", label: "Designation Name", required: true },
    { name: "designationCode", label: "Designation Code", required: true },
    {
      name: "department",
      label: "Department",
      type: "select",
      options: departmentOptions,
      required: true,
    },
    { name: "description", label: "Description", type: "textarea" },
  ];

  return (
    <MasterCrudPage
      title="Designations"
      description="Manage staff designations."
      entityName="Designation"
      service={designationService}
      fields={fields}
      columns={columns}
      validate={validate}
    />
  );
}

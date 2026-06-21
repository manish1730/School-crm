import MasterCrudPage from "../../../components/masters/MasterCrudPage";
import { departmentService } from "../../../services/masterSetupServices";

const fields = [
  { name: "departmentName", label: "Department Name", required: true },
  { name: "departmentCode", label: "Department Code", required: true },
  { name: "hodName", label: "HOD Name" },
  { name: "description", label: "Description", type: "textarea" },
];

const columns = [
  { key: "departmentName", label: "Department Name" },
  { key: "departmentCode", label: "Department Code" },
  { key: "hodName", label: "HOD Name" },
  { key: "description", label: "Description" },
];

const validate = ({ departmentName, departmentCode }) => {
  if (!departmentName) return "Department Name is required";
  if (!departmentCode) return "Department Code is required";
  return null;
};

export default function Departments() {
  return (
    <MasterCrudPage
      title="Departments"
      description="Manage school departments."
      entityName="Department"
      service={departmentService}
      fields={fields}
      columns={columns}
      validate={validate}
    />
  );
}

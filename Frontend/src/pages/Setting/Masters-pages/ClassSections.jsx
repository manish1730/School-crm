import MasterCrudPage from "../../../components/masters/MasterCrudPage";
import { classSectionService } from "../../../services/masterSetupServices";

const fields = [
  { name: "className", label: "Class Name", required: true },
  { name: "classCode", label: "Class Code", required: true },
  { name: "sectionName", label: "Section Name", required: true },
  { name: "sectionCapacity", label: "Section Capacity", type: "number", required: true },
  { name: "classTeacher", label: "Class Teacher" },
  { name: "description", label: "Description", type: "textarea" },
];

const columns = [
  { key: "className", label: "Class Name" },
  { key: "classCode", label: "Class Code" },
  { key: "sectionName", label: "Section" },
  { key: "sectionCapacity", label: "Capacity" },
  { key: "classTeacher", label: "Class Teacher" },
];

const validate = ({
  className,
  classCode,
  sectionName,
  sectionCapacity,
}) => {
  if (!className) return "Class Name is required";
  if (!classCode) return "Class Code is required";
  if (!sectionName) return "Section Name is required";
  if (sectionCapacity === undefined || sectionCapacity === null || sectionCapacity === "") {
    return "Capacity must be greater than 0";
  }
  const capacityNum = Number(sectionCapacity);
  if (Number.isNaN(capacityNum) || capacityNum <= 0) {
    return "Capacity must be greater than 0";
  }
  return null;
};

export default function ClassSections() {
  return (
    <MasterCrudPage
      title="Class & Sections"
      description="Manage classes and sections available in the school."
      entityName="Class & Section"
      service={classSectionService}
      fields={fields}
      columns={columns}
      validate={validate}
      enablePagination
      buildPayload={(formData) => ({
        ...formData,
        sectionCapacity: Number(formData.sectionCapacity),
      })}
    />
  );
}

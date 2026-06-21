import MasterCrudPage from "../../../components/masters/MasterCrudPage";
import { examTypeService } from "../../../services/masterSetupServices";

const fields = [
  { name: "examName", label: "Exam Name", required: true },
  { name: "examCode", label: "Exam Code", required: true },
  { name: "weightage", label: "Weightage (%)", type: "number", required: true },
  { name: "description", label: "Description", type: "textarea" },
];

const columns = [
  { key: "examName", label: "Exam Name" },
  { key: "examCode", label: "Exam Code" },
  { key: "weightage", label: "Weightage (%)" },
  { key: "description", label: "Description" },
];

const validate = ({ examName, examCode, weightage }) => {
  if (!examName) return "Exam Name is required";
  if (!examCode) return "Exam Code is required";
  if (weightage === "") return "Weightage is required";
  if (Number.isNaN(Number(weightage))) {
    return "Weightage must be numeric only";
  }
  if (Number(weightage) < 0 || Number(weightage) > 100) {
    return "Weightage must be between 0 and 100";
  }
  return null;
};

export default function ExamTypes() {
  return (
    <MasterCrudPage
      title="Exam Types"
      description="Configure all examination types used in school."
      entityName="Exam Type"
      service={examTypeService}
      fields={fields}
      columns={columns}
      validate={validate}
      buildPayload={(formData) => ({
        ...formData,
        weightage: Number(formData.weightage),
      })}
    />
  );
}

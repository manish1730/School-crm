import MasterCrudPage from "../../../components/masters/MasterCrudPage";
import { categoryService } from "../../../services/masterSetupServices";

const fields = [
  { name: "categoryName", label: "Category Name", required: true },
  { name: "categoryCode", label: "Category Code", required: true },
  { name: "description", label: "Description", type: "textarea" },
];

const columns = [
  { key: "categoryName", label: "Category Name" },
  { key: "categoryCode", label: "Category Code" },
  { key: "description", label: "Description" },
];

const validate = ({ categoryName, categoryCode }) => {
  if (!categoryName) return "Category Name is required";
  if (!categoryCode) return "Category Code is required";
  return null;
};

export default function Categories() {
  return (
    <MasterCrudPage
      title="Categories"
      description="Manage student categories used in admissions and reporting."
      entityName="Category"
      service={categoryService}
      fields={fields}
      columns={columns}
      validate={validate}
    />
  );
}

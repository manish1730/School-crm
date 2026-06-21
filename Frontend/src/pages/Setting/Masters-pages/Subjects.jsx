import { useEffect, useState } from "react";
import MasterCrudPage from "../../../components/masters/MasterCrudPage";
import {
  classSectionService,
  departmentService,
  subjectService,
} from "../../../services/masterSetupServices";

const columns = [
  { key: "subjectName", label: "Subject Name" },
  { key: "subjectCode", label: "Subject Code" },
  { key: "subjectType", label: "Type" },
  {
    key: "applicableClasses",
    label: "Applicable Classes",
    render: (record) => record.applicableClasses?.join(", ") || "-",
  },
];

const validate = ({
  subjectName,
  subjectCode,
  subjectType,
  applicableClasses,
}) => {
  if (!subjectName) return "Subject Name is required";
  if (!subjectCode) return "Subject Code is required";
  if (!subjectType) return "Subject Type is required";
  if (!applicableClasses?.length) {
    return "At least one class must be selected";
  }
  return null;
};

export default function Subjects() {
  const [classOptions, setClassOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const classes = await classSectionService.getAll();

      setClassOptions(
        (classes.data.data || []).map((item) => ({
          label: `${item.className} - ${item.sectionName}`,
          value: `${item.className} - ${item.sectionName}`,
        }))
      );
    };

    fetchOptions().catch(() => {
      setClassOptions([]);
    });
  }, []);

  const fields = [
    { name: "subjectName", label: "Subject Name", required: true },
    { name: "subjectCode", label: "Subject Code", required: true },
    {
      name: "subjectType",
      label: "Subject Type",
      type: "select",
      options: [
        { label: "Theory", value: "Theory" },
        { label: "Practical", value: "Practical" },
      ],
      required: true,
    },
    {
      name: "applicableClasses",
      label: "Applicable Classes",
      type: "multiselect",
      options: classOptions,
      defaultValue: [],
      required: true,
    },
    { name: "description", label: "Description", type: "textarea" },
  ];

  return (
    <MasterCrudPage
      title="Subjects"
      description="Manage academic subjects taught in school."
      entityName="Subject"
      service={subjectService}
      fields={fields}
      columns={columns}
      validate={validate}
      transformRecord={(record) => ({
        subjectName: record.subjectName || "",
        subjectCode: record.subjectCode || "",
        subjectType: record.subjectType || "",
        applicableClasses: record.applicableClasses || [],
        description: record.description || "",
      })}
    />
  );
}

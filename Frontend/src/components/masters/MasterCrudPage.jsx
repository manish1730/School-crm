import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import MasterModal from "./MasterModal";
import { useAppDispatch } from "../../redux/hooks";
import { fetchMasterDataThunk } from "../../redux/features/master/masterSlice";

const getInitialForm = (fields) =>
  fields.reduce((form, field) => {
    form[field.name] = field.defaultValue ?? (field.type === "multiselect" ? [] : "");
    return form;
  }, {});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const formatDate = (date) =>
  date ? date.split("T")[0] : "";

function FieldInput({ field, value, onChange }) {
  const baseClass =
    "w-full bg-gray-100 rounded-lg px-4 py-3 outline-none";

  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={`${baseClass} min-h-24`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={baseClass}
      >
        <option value="">Select {field.label}</option>
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "multiselect") {
    return (
      <select
        multiple
        value={value}
        onChange={(event) =>
          onChange(
            field.name,
            Array.from(event.target.selectedOptions).map((option) => option.value)
          )
        }
        className={`${baseClass} min-h-32`}
      >
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type || "text"}
      value={value}
      onChange={(event) => onChange(field.name, event.target.value)}
      className={baseClass}
    />
  );
}

export default function MasterCrudPage({
  title,
  description,
  entityName,
  service,
  fields,
  columns,
  validate,
  buildPayload,
  transformRecord,
  enablePagination = false,
  children,
  // Optional Redux Integration:
  reduxRecords,
  reduxLoading,
  reduxError,
  reduxTotal,
  onFetchRedux,
  onSaveRedux,
  onDeleteRedux,
}) {
  const [localRecords, setLocalRecords] = useState([]);
  const [formData, setFormData] = useState(() => getInitialForm(fields));
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [localTotal, setLocalTotal] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const limit = 10;
  const dispatch = useAppDispatch();

  const records = reduxRecords !== undefined ? reduxRecords : localRecords;
  const loading = reduxLoading !== undefined ? reduxLoading : localLoading;
  const error = reduxError !== undefined ? reduxError : localError;
  const total = reduxTotal !== undefined ? reduxTotal : localTotal;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total]
  );

  const fetchRecords = async () => {
    if (onFetchRedux) {
      onFetchRedux({ search, page, limit });
      return;
    }

    try {
      setLocalLoading(true);
      setLocalError("");

      const response = await service.getAll({
        search,
        ...(enablePagination ? { page, limit } : {}),
      });

      setLocalRecords(response.data.data || []);
      setLocalTotal(response.data.total || response.data.count || 0);
    } catch (error) {
      setLocalError(
        getErrorMessage(error, `Failed to load ${entityName}`)
      );
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search, page]);

  const resetModalState = () => {
    setFormData(getInitialForm(fields));
    setEditId(null);
    setLocalError("");
    setSuccessMessage("");
  };

  const openAddModal = () => {
    resetModalState();
    setShowModal(true);
  };

  const handleChange = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEdit = (record) => {
    setLocalError("");
    setSuccessMessage("");
    setEditId(record._id);
    setFormData(
      transformRecord
        ? transformRecord(record)
        : fields.reduce((form, field) => {
            form[field.name] =
              field.type === "date"
                ? formatDate(record[field.name])
                : record[field.name] ?? field.defaultValue ?? "";
            return form;
          }, {})
    );
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLocalError("");
      setSuccessMessage("");

      const validationMessage = validate?.(formData);

      if (validationMessage) {
        setLocalError(validationMessage);
        return;
      }

      const payload = buildPayload ? buildPayload(formData) : formData;

      if (onSaveRedux) {
        await onSaveRedux(editId, payload);
        setSuccessMessage(editId ? `${entityName} updated successfully` : `${entityName} created successfully`);
      } else {
        const response = editId
          ? await service.update(editId, payload)
          : await service.create(payload);
        setSuccessMessage(response.data.message);
      }

      await fetchRecords();
      dispatch(fetchMasterDataThunk());

      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage("");
        setEditId(null);
      }, 1000);
    } catch (error) {
      setLocalError(
        getErrorMessage(error, `Failed to save ${entityName}`)
      );
    }
  };

  const handleDelete = async () => {
    try {
      setLocalError("");
      setSuccessMessage("");

      if (onDeleteRedux) {
        await onDeleteRedux(deleteRecord._id);
        setSuccessMessage(`${entityName} deleted successfully`);
      } else {
        const response = await service.remove(deleteRecord._id);
        setSuccessMessage(response.data.message);
      }

      setDeleteRecord(null);
      await fetchRecords();
      dispatch(fetchMasterDataThunk());
    } catch (error) {
      setLocalError(
        getErrorMessage(error, `Failed to delete ${entityName}`)
      );
    }
  };

  return (
    <div className="bg-white p-4 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          {description && (
            <p className="text-gray-600 text-sm">{description}</p>
          )}
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg"
        >
          + Add
        </button>
      </div>

      {error && !showModal && !deleteRecord && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600">
          {error}
        </div>
      )}

      {successMessage && !showModal && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={`Search ${title}`}
          className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none"
        />
      </div>

      {children}

      <div className="overflow-x-auto">
        <div
          className="grid bg-gray-100 p-4 font-semibold rounded-lg min-w-[760px]"
          style={{ gridTemplateColumns: `60px repeat(${columns.length}, minmax(140px, 1fr)) 120px` }}
        >
          <div>#</div>
          {columns.map((column) => (
            <div key={column.key}>{column.label}</div>
          ))}
          <div className="text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-4 text-gray-500">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-4 text-gray-500">No records found</div>
        ) : (
          records.map((record, index) => (
            <div
              key={record._id}
              className="grid p-4 items-center min-w-[760px]"
              style={{ gridTemplateColumns: `60px repeat(${columns.length}, minmax(140px, 1fr)) 120px` }}
            >
              <div>{enablePagination ? (page - 1) * limit + index + 1 : index + 1}</div>
              {columns.map((column) => (
                <div key={column.key} className="text-sm text-gray-700">
                  {column.render
                    ? column.render(record)
                    : record[column.key] || "-"}
                </div>
              ))}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleEdit(record)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => setDeleteRecord(record)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {enablePagination && (
        <div className="flex justify-end items-center gap-3 mt-4">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <MasterModal
          title={editId ? `Edit ${entityName}` : `Add ${entityName}`}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg"
              >
                {editId ? "Update" : "Save"}
              </button>
            </div>
          }
        >
          <div className="space-y-4 mb-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-2">
                  {field.label}
                </label>
                <FieldInput
                  field={field}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700">
              {successMessage}
            </div>
          )}
        </MasterModal>
      )}

      {deleteRecord && (
        <MasterModal
          title={`Delete ${entityName}`}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteRecord(null)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-5 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          }
        >
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this {entityName}?
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600">
              {error}
            </div>
          )}
        </MasterModal>
      )}
    </div>
  );
}

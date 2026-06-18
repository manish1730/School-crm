const documents = [
  { name: "studentPhoto", label: "Student Photo" },
  { name: "aadhaar", label: "Aadhaar Card" },
  { name: "birthCertificate", label: "Birth Certificate" },
  { name: "transferCertificate", label: "Transfer Certificate" },
  { name: "reportCard", label: "Previous Report Card" },
  { name: "otherDocuments", label: "Other Documents" },
];

const Documents = ({ formData, onDocumentChange, submitAdmission, loading, prev }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-6">
        Upload Documents
      </h2>

      <div className="grid md:grid-cols-2 gap-5">
        {documents.map((document) => (
          <div key={document.name}>
            <label className="block mb-2 font-medium">
              {document.label}
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => onDocumentChange(document.name, event.target.files?.[0])}
              className="w-full border rounded-lg p-3"
            />

            {formData.documents?.[document.name] && (
              <p className="mt-2 text-xs text-gray-500">
                Selected: {formData.documents[document.name]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <label className="flex gap-3 items-center">
          <input type="checkbox" />
          <span>
            I hereby declare that all information provided is true and correct.
          </span>
        </label>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prev}
          className="px-6 py-2 border rounded-lg"
        >
          ← Previous
        </button>

        <button
          onClick={submitAdmission}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Admission"}
        </button>
      </div>
    </div>
  );
};

export default Documents;

const FeeToast = ({ toast, onClose }) => {
  if (!toast?.message) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed right-5 top-5 z-[60] min-w-[280px] rounded-xl px-4 py-3 text-white shadow-xl ${
        isSuccess ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white"
          aria-label="Close notification"
        >
          x
        </button>
      </div>
    </div>
  );
};

export default FeeToast;

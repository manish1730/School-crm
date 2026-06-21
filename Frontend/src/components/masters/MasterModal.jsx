export default function MasterModal({
  title,
  children,
  footer,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {title}
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {children}

        {footer}
      </div>
    </div>
  );
}

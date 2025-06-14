import React, { useEffect, useRef } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ConfirmationModal = ({
  isOpen,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showIcon = true,
}) => {
  const backdropRef = useRef();

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  // Close on outside click
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onCancel();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="bg-gray-100 rounded-xl shadow-xl p-6 w-full max-w-sm">
        {showIcon && (
          <div className="flex justify-center mb-4 text-red-500">
            <ExclamationTriangleIcon className="h-10 w-10" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-center text-gray-800 mb-3">
          {title}
        </h2>
        <p className="text-gray-600 text-center mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:cursor-pointer hover:bg-indigo-900"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

import React from "react";
import { X, AlertCircle } from "lucide-react";
import Button from "../ui/Button";

const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  invoiceNumber,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Delete Invoice
          </h3>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete invoice{" "}
            <span className="font-medium text-slate-900">#{invoiceNumber}</span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Delete Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;

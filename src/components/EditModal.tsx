import { useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface EditModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const EditModal = ({ title, open, onClose, children }: EditModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-lg border shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default EditModal;

export const FormField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-card-foreground">{label}</label>
    {children}
  </div>
);

export const FormInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
    className="w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
  />
);

export const FormTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
  />
);

export const SaveButton = ({ loading, label = "Save" }: { loading: boolean; label?: string }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
  >
    {loading ? "Saving..." : label}
  </button>
);

export const DeleteButton = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="w-full py-2.5 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
  >
    {loading ? "Deleting..." : "Delete"}
  </button>
);

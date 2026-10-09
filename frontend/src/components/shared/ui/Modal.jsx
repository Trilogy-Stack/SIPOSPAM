// src/components/shared/ui/Modal.jsx
"use client";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  // Tutup dengan tombol Esc
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4 font-poppins backdrop-blur-[2px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-xl bg-white px-7 py-6 shadow-2xl"
      >
        <h2 className="mb-5 border-b border-gray-200 pb-3 text-center text-lg font-semibold text-gray-900">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
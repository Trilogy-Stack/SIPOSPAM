"use client";
import { useEffect, useRef } from "react";

// dialog untuk perubahan yang belum disimpan 

export function setUnsavedHandler(fn) {
  if (typeof window !== "undefined") window.__unsavedHandler = fn;
}

export function hasUnsavedChanges() {
  return typeof window !== "undefined" && !!window.__unsavedHandler;
}

export function runWithUnsavedGuard(proceed) {
  if (typeof window !== "undefined" && window.__unsavedHandler) {
    window.__unsavedHandler(proceed);
  } else {
    proceed();
  }
}

// navbar tetap terang dan bisa diklik
export default function Modal({ open, onClose, title, children, closeOnBackdrop = true }) {
  const downOnBackdrop = useRef(false);

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
      // klik luar dialog/area transparan
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (closeOnBackdrop && downOnBackdrop.current && e.target === e.currentTarget) {
          onClose?.();
        }
      }}
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/40 px-4 font-poppins"
    >
      <div
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
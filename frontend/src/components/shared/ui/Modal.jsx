// src/components/shared/ui/Modal.jsx
"use client";
import { useEffect, useRef } from "react";

// ── Penjaga perubahan yang belum disimpan ─────────────────────────────
// Form memasang handler saat ada perubahan; Navbar memanggil runWithUnsavedGuard
// sebelum pindah halaman supaya pengguna ditanya dulu.

// export function setUnsavedHandler(fn) {
//   unsavedHandler = fn;
// }
export function setUnsavedHandler(fn) {
  if (typeof window !== "undefined") window.__unsavedHandler = fn;
}

// export function hasUnsavedChanges() {
//   return !!unsavedHandler;
// }
export function hasUnsavedChanges() {
  return typeof window !== "undefined" && !!window.__unsavedHandler;
}

// export function runWithUnsavedGuard(proceed) {
//   if (unsavedHandler) unsavedHandler(proceed);
//   else proceed();
// }
export function runWithUnsavedGuard(proceed) {
  if (typeof window !== "undefined" && window.__unsavedHandler) {
    window.__unsavedHandler(proceed);
  } else {
    proceed();
  }
}

// z-[1400] sengaja di bawah Navbar (z-[1500]) supaya navbar tetap terang dan bisa diklik.
export default function Modal({ open, onClose, title, children, closeOnBackdrop = true }) {
  const downOnBackdrop = useRef(false);

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
      // Dianggap klik luar hanya kalau tekan DAN lepas mouse sama-sama di area luar
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
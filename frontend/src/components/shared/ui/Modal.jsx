"use client";
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4 font-poppins"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] rounded-lg bg-white px-6 py-5 shadow-xl"
      >
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-medium text-gray-900">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
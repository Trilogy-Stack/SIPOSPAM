"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PhotoLightbox({ photos = [], index, onClose, onChange }) {
  const total = photos.length;
  const open = index !== null && index !== undefined && index >= 0 && index < total;

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChange((index - 1 + total) % total);
      if (e.key === "ArrowRight") onChange((index + 1) % total);
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, total, onClose, onChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-white/15 hover:bg-white/30 rounded-full p-2"
        title="Tutup"
      >
        <X className="w-5 h-5" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange((index - 1 + total) % total);
            }}
            className="absolute left-4 text-white bg-white/15 hover:bg-white/30 rounded-full p-2"
            title="Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange((index + 1) % total);
            }}
            className="absolute right-4 text-white bg-white/15 hover:bg-white/30 rounded-full p-2"
            title="Berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <img
        src={photos[index]}
        alt={`Foto fasilitas ${index + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-md"
        onClick={(e) => e.stopPropagation()}
      />

      <p className="absolute bottom-4 text-white/80 text-xs md:text-sm">
        {index + 1} / {total}
      </p>
    </div>
  );
}
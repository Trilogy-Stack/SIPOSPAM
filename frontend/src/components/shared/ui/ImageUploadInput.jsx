// src/components/shared/ui/ImageUploadInput.jsx
"use client";
import { useState } from "react";
import { ImagePlus } from "lucide-react";

export default function ImageUploadInput({ value, onChange }) {
  const [preview, setPreview] = useState(value || null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file); // preview sementara di browser
    setPreview(localUrl);
    onChange(file, localUrl); // file asli dikirim ke parent untuk nanti di-upload ke Supabase Storage
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-[#F8F8FA]">
        {preview ? (
          <img src={preview} alt="preview" className="h-full w-full object-contain" />
        ) : (
          <ImagePlus size={22} className="text-gray-400" />
        )}
      </div>
      <label className="cursor-pointer rounded border border-[#1BA3BA] px-4 py-2 text-sm font-medium text-[#1BA3BA] transition-colors hover:bg-[#1BA3BA] hover:text-white">
        {preview ? "Ganti ikon" : "Unggah ikon"}
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>
    </div>
  );
}
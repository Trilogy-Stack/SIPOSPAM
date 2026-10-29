"use client";
import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";

export default function ImageUploadInput({ value, onChange }) {
  const [broken, setBroken] = useState(false);
  const preview = value && !broken ? value : null;

  // reset status gambar rusak setiap nilai berganti
  useEffect(() => {
    setBroken(false);
  }, [value]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file, URL.createObjectURL(file));
    e.target.value = ""; 
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-[#F8F8FA]">
        {preview ? (
          <img
            src={preview}
            alt="preview"
            onError={() => setBroken(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImagePlus size={20} className="text-gray-400" />
        )}
      </div>
      <label className="cursor-pointer rounded-md border border-[#1BA3BA] px-3.5 py-1.5 text-sm font-medium text-[#1BA3BA] transition-colors hover:bg-[#1BA3BA] hover:text-white">
        {preview ? "Ganti ikon" : "Unggah ikon"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </label>
    </div>
  );
}
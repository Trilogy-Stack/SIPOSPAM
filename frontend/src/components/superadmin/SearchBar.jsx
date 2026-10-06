"use client";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  options = [],
  placeholder = "Cari Admin wilayah",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const pick = (nama) => {
    onChange(nama);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full max-w-[470px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded border border-gray-700 bg-white px-4 py-2.5 text-left text-sm"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <Search size={22} className="shrink-0 text-gray-900" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-[1100] mt-1 max-h-64 overflow-y-auto rounded border border-gray-300 bg-white py-1 shadow-lg"
        >
          <li>
            <button
              type="button"
              onClick={() => pick("")}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                value === "" ? "font-semibold text-[#1BA3BA]" : "text-gray-500"
              }`}
            >
              Semua wilayah
            </button>
          </li>
          {options.map((nama) => (
            <li key={nama}>
              <button
                type="button"
                role="option"
                aria-selected={value === nama}
                onClick={() => pick(nama)}
                className={`w-full px-4 py-2 text-left text-sm uppercase hover:bg-gray-100 ${
                  value === nama ? "font-semibold text-[#1BA3BA]" : "text-gray-800"
                }`}
              >
                {nama}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
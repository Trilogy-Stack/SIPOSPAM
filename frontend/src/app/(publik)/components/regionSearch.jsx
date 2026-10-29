"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function RegionSearch({
  value,
  onChange,
  options = [],
  placeholder = "Cari Daerah / Kota",
}) {
  const text = value ?? "";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

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

  const norm = (s) => s.trim().toLowerCase();
  const exactMatch = options.some((o) => norm(o) === norm(text));
  const query = exactMatch ? "" : norm(text);
  const items = options.filter((o) => o.toLowerCase().includes(query));

  useEffect(() => {
    if (open && active >= 0) {
      listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
    }
  }, [active, open]);

  const pick = (val) => {
    onChange(val);
    setOpen(false);
    setActive(-1);
  };

  const handleInput = (e) => {
    onChange(e.target.value);
    setOpen(true);
    setActive(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && items[active]) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          value={text}
          onChange={handleInput}
          onFocus={() => {
            setOpen(true);
            setActive(-1);
          }}
          onClick={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => {
            inputRef.current?.focus();
            setOpen(true);
          }}
          aria-label="Buka daftar wilayah"
          className="shrink-0"
        >
          <ChevronDown
            size={18}
            className={`text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[1100] mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {items.length === 0 ? (
            <li className="px-4 py-2 text-sm text-slate-400">Wilayah tidak ditemukan</li>
          ) : (
            items.map((item, i) => (
              <li key={item} role="option" aria-selected={text === item}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // jaga fokus input saat klik
                  onClick={() => pick(item)}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full px-3.5 py-2 text-left text-[13px] ${
                    i === active ? "bg-slate-100" : ""
                  } ${text === item ? "font-semibold text-blue-600" : "text-slate-800"}`}
                >
                  {item}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
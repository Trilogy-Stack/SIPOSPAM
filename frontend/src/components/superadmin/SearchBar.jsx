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
  const exactMatch = options.some((o) => norm(o) === norm(value));
  const query = exactMatch ? "" : norm(value);

  const filtered = options.filter((o) => o.toLowerCase().includes(query));
  const items =
    query === ""
      ? [{ label: "Semua wilayah", val: "" }, ...filtered.map((o) => ({ label: o, val: o }))]
      : filtered.map((o) => ({ label: o, val: o }));

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
      pick(items[active].val);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-[400px]">
      <div className="flex w-full items-center rounded-md border border-gray-300 bg-white px-3.5 py-2 transition-colors focus-within:border-[#1BA3BA] focus-within:ring-1 focus-within:ring-[#1BA3BA]">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          value={value}
          onChange={handleInput}
          onFocus={() => { setOpen(true); setActive(-1); }}
          onClick={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => { inputRef.current?.focus(); setOpen(true); }}
          aria-label="Cari"
          className="shrink-0 text-gray-900"
        >
          <Search size={18} className="text-gray-500" />
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[1100] mt-1 max-h-64 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {items.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-400">Wilayah tidak ditemukan</li>
          ) : (
            items.map((item, i) => (
              <li key={item.label} role="option" aria-selected={value === item.val}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => pick(item.val)}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full px-3.5 py-2 text-left text-[13px] ${
                    item.val === "" ? "" : "uppercase"
                  } ${i === active ? "bg-gray-100" : ""} ${
                    value === item.val && item.val !== ""
                      ? "font-semibold text-[#1BA3BA]"
                      : item.val === ""
                      ? "text-gray-500"
                      : "text-gray-800"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
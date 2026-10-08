"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { getWilayahList } from "@/lib/api";

const PROVINCE = "Jawa Tengah";

let cachedData = null;

// TODO BACKEND: ganti data contoh ini dengan data wilayah dari API
// (kab/kota → kecamatan → kode pos). Kode pos di bawah hanya contoh.
const REGION_DATA = {
  "Kota Salatiga": ["Sidorejo", "Argomulyo", "Tingkir", "Sidomukti"],
  "Kab. Semarang": ["Ungaran Barat", "Ungaran Timur"],
  "Kab. Demak": ["Demak"],
  "Kab. Boyolali": ["Boyolali"],
};

export const EMPTY_REGION = { province: PROVINCE, city: "", district: "" };

// Teks yang ditampilkan: "Sidorejo, Kota Salatiga"
export const formatRegion = (r) => {
  if (!r) return "";
  if (typeof r === "string") return r;
  return r.district ? `${r.district}, ${r.city}` : "";
};

const TABS = [
  { key: "city", label: "Kabupaten/Kota", placeholder: "Cari kabupaten/kota" },
  { key: "district", label: "Kecamatan", placeholder: "Cari kecamatan" },
];

export default function RegionPicker({ value, onChange, required = true }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("city");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState(EMPTY_REGION);

  const openPicker = () => {
  setDraft(value?.district ? value : EMPTY_REGION);
  setTab("city");
  setSearch("");
  setOpen(true);
};

const options = useMemo(() => {
  const list =
    tab === "city" ? Object.keys(REGION_DATA) : REGION_DATA[draft.city] || [];
  return list.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
}, [tab, draft, search]);

const canOpenTab = (key) => key === "city" || (key === "district" && draft.city);

const pick = (opt) => {
  setSearch("");
  if (tab === "city") {
    setDraft({ ...EMPTY_REGION, city: opt });
    setTab("district");
  } else {
    onChange({ ...draft, district: opt }); // kecamatan dipilih → selesai
    setOpen(false);
  }
};

  const text = formatRegion(value);
  const activeTab = TABS.find((t) => t.key === tab);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs md:text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#1a9fb8]"
      >
        <span className={text ? "text-slate-700" : "text-slate-400"}>
          {text || "Pilih kabupaten/kota, kecamatan"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {/* Agar validasi "required" pada form tetap jalan */}
      <input
        tabIndex={-1}
        required={required}
        value={text}
        onChange={() => {}}
        className="absolute left-0 bottom-0 w-full h-0 opacity-0 pointer-events-none"
      />

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/0" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-xl border border-slate-100 px-4 pt-3 pb-4">
            {/* Tab */}
            <div className="flex gap-4 border-b border-slate-200 pb-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  disabled={!canOpenTab(t.key)}
                  onClick={() => {
                    setTab(t.key);
                    setSearch("");
                  }}
                  className={`text-xs md:text-sm ${
                    tab === t.key
                      ? "font-semibold text-slate-900"
                      : "text-slate-300 disabled:cursor-not-allowed"
                  } ${tab !== t.key && canOpenTab(t.key) ? "!text-slate-500" : ""}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Cari */}
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab.placeholder}
              className="w-full mt-3 border border-slate-200 rounded-md px-3 py-2 text-xs md:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1a9fb8]"
            />

            {/* Daftar */}
            <div className="mt-3 border-t border-slate-200 pt-2 max-h-40 overflow-y-auto">
              {options.length === 0 ? (
                <p className="text-xs md:text-sm text-slate-400 py-2">Data tidak ditemukan.</p>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pick(opt)}
                    className="block w-full text-left text-xs md:text-sm text-slate-800 py-1.5 px-1 hover:bg-slate-50 rounded"
                  >
                    {opt}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
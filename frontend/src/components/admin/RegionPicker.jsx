"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

const PROVINCE = "Jawa Tengah";

// TODO BACKEND: ganti data contoh ini dengan data wilayah dari API
// (kab/kota → kecamatan → kode pos). Kode pos di bawah hanya contoh.
const REGION_DATA = {
  "Kota Salatiga": {
    Sidorejo: ["50711"],
    Argomulyo: ["50734"],
    Tingkir: ["50742"],
    Sidomukti: ["50721"],
  },
  "Kab. Semarang": {
    "Ungaran Barat": ["50517"],
    "Ungaran Timur": ["50519"],
  },
  "Kab. Demak": {
    Demak: ["59511"],
  },
  "Kab. Boyolali": {
    Boyolali: ["57311"],
  },
};

export const EMPTY_REGION = { province: PROVINCE, city: "", district: "", postalCode: "" };

// Teks yang ditampilkan: "Sidorejo, Kota Salatiga, 50711"
export const formatRegion = (r) => {
  if (!r) return "";
  if (typeof r === "string") return r;
  return r.postalCode ? `${r.district}, ${r.city}, ${r.postalCode}` : "";
};

const TABS = [
  { key: "city", label: "Kabupaten/Kota", placeholder: "Cari kabupaten/kota" },
  { key: "district", label: "Kecamatan", placeholder: "Cari kecamatan" },
  { key: "postalCode", label: "Kode Pos", placeholder: "Cari kode pos" },
];

export default function RegionPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("city");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState(EMPTY_REGION);

  const openPicker = () => {
    setDraft(value?.postalCode ? value : EMPTY_REGION);
    setTab("city");
    setSearch("");
    setOpen(true);
  };

  const options = useMemo(() => {
    let list = [];
    if (tab === "city") list = Object.keys(REGION_DATA);
    else if (tab === "district") list = Object.keys(REGION_DATA[draft.city] || {});
    else list = REGION_DATA[draft.city]?.[draft.district] || [];
    return list.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  }, [tab, draft, search]);

  const canOpenTab = (key) =>
    key === "city" ||
    (key === "district" && draft.city) ||
    (key === "postalCode" && draft.district);

  const pick = (opt) => {
    setSearch("");
    if (tab === "city") {
      setDraft({ ...EMPTY_REGION, city: opt });
      setTab("district");
    } else if (tab === "district") {
      setDraft((d) => ({ ...d, district: opt, postalCode: "" }));
      setTab("postalCode");
    } else {
      onChange({ ...draft, postalCode: opt });
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
        className="w-full border border-slate-200 rounded-md px-3 py-2 text-[11px] text-left flex items-center justify-between focus:outline-none focus:border-[#1a9fb8]"
      >
        <span className={text ? "text-slate-700" : "text-slate-400"}>
          {text || "Pilih kabupaten/kota, kecamatan, kode pos"}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>

      {/* Agar validasi "required" pada form tetap jalan */}
      <input
        tabIndex={-1}
        required
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
                  className={`text-[11px] ${
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
              className="w-full mt-3 border border-slate-200 rounded-md px-3 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1a9fb8]"
            />

            {/* Daftar */}
            <div className="mt-3 border-t border-slate-200 pt-2 max-h-40 overflow-y-auto">
              {options.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-2">Data tidak ditemukan.</p>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pick(opt)}
                    className="block w-full text-left text-[11px] text-slate-800 py-1.5 px-1 hover:bg-slate-50 rounded"
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
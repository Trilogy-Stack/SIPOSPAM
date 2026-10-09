"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import rawWilayah from "@/data/kabupaten_kota_kecamatan.json";

const PROVINCE = "Jawa Tengah";

// "KABUPATEN CILACAP" → "Kab. Cilacap", "KOTA SALATIGA" → "Kota Salatiga"
const titleCase = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
const formatCity = (s) => titleCase(s).replace(/^Kabupaten /, "Kab. ");

// Disiapkan sekali saat file dimuat: nama dirapikan, duplikat dibuang, diurutkan
const WILAYAH = Object.entries(rawWilayah)
  .map(([city, districts]) => ({
    city: formatCity(city),
    districts: [...new Set(districts.map(titleCase))].sort((a, b) =>
      a.localeCompare(b, "id")
    ),
  }))
  .sort((a, b) => a.city.localeCompare(b.city, "id"));

export const EMPTY_REGION = { province: PROVINCE, city: "", district: "" };

// Teks yang ditampilkan dan dikirim ke backend: "Sidorejo, Kota Salatiga"
export const formatRegion = (r) => {
  if (!r) return "";
  if (typeof r === "string") return r;
  return r.district ? `${r.district}, ${r.city}` : "";
};

// Kata kunci pencarian peta dari wilayah yang dipilih
export const regionToQueries = (r) => {
  if (!r || typeof r === "string" || !r.district) return { main: "", fallback: "" };
  const city = r.city.replace(/^Kab\. /, "Kabupaten ");
  return {
    main: `Kecamatan ${r.district}, ${city}, Jawa Tengah, Indonesia`,
    fallback: `${city}, Jawa Tengah, Indonesia`,
  };
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
      tab === "city"
        ? WILAYAH.map((w) => w.city)
        : WILAYAH.find((w) => w.city === draft.city)?.districts || [];
    return list.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  }, [tab, draft.city, search]);

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
"use client";

import { useState, useMemo, useEffect, useRef } from "react"; 
import { ChevronDown, X } from "lucide-react";
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

// Kembalikan teks area tersimpan ("Sidorejo, Kota Salatiga") menjadi objek wilayah
export const parseRegion = (area) => {
  if (!area || typeof area !== "string") return EMPTY_REGION;
  const parts = area.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return EMPTY_REGION; // format tidak dikenali
  return { province: PROVINCE, district: parts[0], city: parts[1] };
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
  const searchRef = useRef(null);

  // Fokus ke kolom cari saat panel dibuka atau pindah tab
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open, tab]);

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

  const isSelected = (opt) =>
    tab === "city"
      ? opt === draft.city
      : value?.city === draft.city && value?.district === opt;

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

  const clear = () => onChange(EMPTY_REGION);

  const text = formatRegion(value); // nilai yang sudah final (dipakai untuk validasi)
  const activeTab = TABS.find((t) => t.key === tab);

  // Saat panel terbuka dan kab/kota sudah dipilih, tampilkan langsung di kolom
  const choosingDistrict = open && draft.city && !draft.district;
  const shownText = choosingDistrict ? draft.city : text;

  return (
    <div className="relative">
      {/* Kolom pilihan */}
      <button
        type="button"
        onClick={openPicker}
        className={`w-full border rounded-md pl-3 pr-16 py-2.5 text-xs md:text-sm text-left focus:outline-none ${
          open ? "border-[#1a9fb8]" : "border-slate-300 focus:border-[#1a9fb8]"
        }`}
      >
        <span className="block truncate">
          {shownText ? (
            <>
              <span className="text-slate-800">{shownText}</span>
              {choosingDistrict && (
                <span className="text-slate-400">, pilih kecamatan...</span>
              )}
            </>
          ) : (
            <span className="text-slate-400">Pilih kabupaten/kota, kecamatan</span>
          )}
        </span>
      </button>

      {text && (
        <button
          type="button"
          onClick={clear}
          title="Hapus pilihan"
          className="absolute right-9 top-1/2 -translate-y-1/2 bg-slate-400 hover:bg-slate-500 text-white rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />

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
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden">
            {/* Tab */}
            <div className="flex border-b border-slate-200">
              {TABS.map((t) => {
                const active = tab === t.key;
                const enabled = canOpenTab(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    disabled={!enabled}
                    onClick={() => {
                      setTab(t.key);
                      setSearch("");
                    }}
                    className={`flex-1 text-center py-3 text-xs md:text-sm border-b-2 -mb-px transition ${
                      active
                        ? "border-[#1a9fb8] text-[#1a9fb8] font-medium"
                        : enabled
                        ? "border-transparent text-slate-700 hover:text-slate-900"
                        : "border-transparent text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Cari */}
            <div className="px-3 pt-3">
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab.placeholder}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs md:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1a9fb8]"
              />
            </div>

            {/* Daftar */}
            <div className="mt-2 max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <p className="text-xs md:text-sm text-slate-400 px-4 py-3">Data tidak ditemukan.</p>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pick(opt)}
                    className={`block w-full text-left px-4 py-3 text-xs md:text-sm text-slate-800 hover:bg-slate-100 ${
                      isSelected(opt) ? "bg-slate-100 font-medium" : ""
                    }`}
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
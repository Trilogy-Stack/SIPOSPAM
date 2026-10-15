"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Locate,
  Check,
  X,
  Search,
  Flame,
  Hospital,
  Siren,
  PhoneCall,
  Fuel,
  Wrench,
} from "lucide-react";
import { getEmergencyApi, getPospamsApi, NASIONAL } from "@/lib/api";
import RegionSearch from "../components/regionSearch";
import CallConfirmDialog from "../components/callConfirmDialog";

// Ikon per kategori (sama dengan halaman kelola nomor darurat di admin; kategori disimpan huruf kecil)
const CATEGORY_ICON = {
  bencana: Flame,
  medis: Hospital,
  keamanan: Siren,
  bbm: Fuel,
  bengkel: Wrench,
  Lainnya: PhoneCall,
};

const TAMPIL_AWAL = 5; // jumlah layanan sekitar yang tampil sebelum "Tampilkan semua"

const toNum = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function haversine(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${Number(km.toFixed(1))} Km`;
}

// Logo instansi tanpa kotak/latar di sekelilingnya; kalau gambar kosong atau gagal dimuat,
// tampil ikon telepon
function NasionalIcon({ src }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <Phone className="w-6 h-6 text-slate-400" />
      )}
    </div>
  );
}

export default function NomorDaruratPage() {
  const [items, setItems] = useState([]);
  // Titik pospam: dipakai HANYA untuk mendeteksi wilayah lokasi pemudik (sama seperti halaman Pospam Terdekat)
  const [pospamPoints, setPospamPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [region, setRegion] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [locError, setLocError] = useState("");
  const [showAll, setShowAll] = useState(false);
  // Instansi yang sedang menunggu konfirmasi panggilan (null = dialog tertutup)
  const [callTarget, setCallTarget] = useState(null);

  useEffect(() => {
    getEmergencyApi({ limit: 1000 })
      .then((res) => setItems(Array.isArray(res) ? res : res?.data || []))
      .catch((err) => {
        console.error("Gagal ambil nomor darurat:", err);
        setError("Gagal memuat nomor darurat. Coba lagi nanti.");
      })
      .finally(() => setLoading(false));

    // Gagal memuat pospam tidak boleh mengganggu daftar nomor darurat
    getPospamsApi({ limit: 1000 })
      .then((res) => {
        const arr = Array.isArray(res) ? res : res?.data || [];
        setPospamPoints(
          arr
            .map((p) => ({
              region: p.region || "",
              lat: toNum(p.latitude ?? p.lat),
              lng: toNum(p.longitude ?? p.lng),
            }))
            .filter((p) => p.region && p.lat != null && p.lng != null)
        );
      })
      .catch((err) => console.error("Gagal ambil data pospam:", err));
  }, []);

  // Nomor nasional (grid ikon) dan layanan lokal (punya koordinat) dipisah dari satu sumber data
  const nasional = useMemo(() => items.filter((n) => n.region === NASIONAL), [items]);
  const lokal = useMemo(
    () =>
      items
        .filter((n) => n.region !== NASIONAL)
        .map((n) => ({ ...n, lat: toNum(n.latitude), lng: toNum(n.longitude) })),
    [items]
  );

  // Daftar wilayah = gabungan wilayah pospam dan wilayah layanan lokal (supaya sama dengan Pospam Terdekat)
  const availableRegions = useMemo(
    () =>
      Array.from(
        new Set(
          [...pospamPoints, ...lokal]
            .map((n) => n.region)
            .filter((r) => r && r.trim() !== "" && r !== "-")
        )
      ).sort(),
    [pospamPoints, lokal]
  );

  // Daftar "Layanan di sekitar anda". null = belum ada wilayah dipilih dan lokasi belum aktif
  const layanan = useMemo(() => {
    const target = region.toLowerCase().trim();
    if (!target && !userCoords) return null;

    let list = target
      ? lokal.filter((n) =>
          [n.region, n.area, n.location].some((f) => (f || "").toLowerCase().includes(target))
        )
      : lokal;

    if (userCoords) {
      list = list
        .map((n) => ({ ...n, distance: haversine(userCoords.lat, userCoords.lng, n.lat, n.lng) }))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      list = [...list].sort((a, b) => a.agency_name.localeCompare(b.agency_name, "id"));
    }
    return list;
  }, [lokal, region, userCoords]);

  const handleRegionChange = (value) => {
    setRegion(value);
    setShowAll(false);
  };

  const handleAktifkanLokasi = () => {
    if (!navigator.geolocation) {
      setLocError("Browser Anda tidak mendukung lokasi.");
      return;
    }
    setIsLoadingLoc(true);
    setLocError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        // Wilayah lokasi pemudik = wilayah POSPAM terdekat (sama dengan halaman Pospam Terdekat).
        // Layanan darurat tidak ada di semua kabupaten/kota, jadi tidak cocok dipakai untuk
        // menentukan wilayah. Kalau data pospam kosong, baru pakai layanan lokal sebagai cadangan.
        const sumber = pospamPoints.length > 0 ? pospamPoints : lokal;
        let detected = "";
        let min = Infinity;
        sumber.forEach((n) => {
          const d = haversine(coords.lat, coords.lng, n.lat, n.lng);
          if (d !== null && d < min) {
            min = d;
            detected = n.region;
          }
        });

        if (detected) setRegion(detected);
        setUserCoords(coords);
        setShowAll(false);
        setIsLoadingLoc(false);
      },
      () => {
        setLocError("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.");
        setIsLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Kembali ke state awal (kosong), sama seperti halaman Pospam Terdekat
  const handleResetLokasi = () => {
    setUserCoords(null);
    setRegion("");
    setLocError("");
    setShowAll(false);
  };

  const tampil = layanan ? (showAll ? layanan : layanan.slice(0, TAMPIL_AWAL)) : [];

  return (
    <div className="p-4 space-y-4 pb-10 text-slate-800">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
          {error}
        </div>
      )}

      {/* Pilih wilayah + aktifkan lokasi */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-800 mb-1.5 block">
            Pospam Terdekat
          </label>
          <RegionSearch
            value={region}
            onChange={handleRegionChange}
            options={availableRegions}
            placeholder="Cari Daerah"
          />
        </div>

        {/* Tombol Aktifkan Lokasi */}
        <button
          type="button"
          onClick={handleAktifkanLokasi}
          disabled={isLoadingLoc || loading}
          className={`w-full text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98 disabled:opacity-70 ${
            userCoords ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Locate className="w-4 h-4" />
          {isLoadingLoc
            ? "Mendeteksi Lokasi..."
            : userCoords
            ? "Perbarui Lokasi Saya"
            : "Aktifkan Lokasi"}
        </button>

        {locError && <p className="text-xs text-red-600">{locError}</p>}

        {/* Badge koordinat + tombol reset (X) */}
        {userCoords && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Lokasi Anda Berhasil Terdeteksi</span>
              </div>
              <p className="text-[11px] font-mono text-emerald-600 mt-0.5">
                Lat: <span className="font-bold">{userCoords.lat.toFixed(6)}</span> | Lng:{" "}
                <span className="font-bold">{userCoords.lng.toFixed(6)}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetLokasi}
              title="Hapus filter lokasi"
              className="bg-emerald-200/80 hover:bg-emerald-300 text-emerald-800 p-1.5 rounded-full transition shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Nomor nasional: kartu putih berisi logo, ketuk untuk menelepon */}
      {loading ? (
        <p className="text-xs text-slate-500 text-center py-6">Memuat...</p>
      ) : (
        nasional.length > 0 && (
          <div className="grid grid-cols-3 gap-3 px-2 pt-2">
            {nasional.map((n) => (
              <button
                type="button"
                key={n.id}
                onClick={() => setCallTarget(n)}
                aria-label={`Hubungi ${n.agency_name} (${n.telephone})`}
                title={`${n.agency_name} - ${n.telephone}`}
                className="group flex aspect-square w-full flex-col items-center justify-center rounded-2xl bg-white p-2.5 shadow-sm border border-slate-100 transition hover:shadow-md active:scale-95"
              >
                {/* Logo langsung di atas kartu, tanpa kotak di dalamnya */}
                <NasionalIcon src={n.icon} />

                <span className="mt-1.5 line-clamp-2 text-center text-[11px] font-bold leading-tight text-slate-800">
                  {n.agency_name}
                </span>
              </button>
            ))}
          </div>
        )
      )}

      {/* Layanan di sekitar */}
      <section className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-900">Layanan di sekitar anda</h3>

        {layanan === null ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-medium text-slate-500 max-w-[240px] mx-auto leading-relaxed">
              Pilih wilayah atau aktifkan lokasi Anda untuk melihat layanan di sekitar
            </p>
          </div>
        ) : layanan.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada layanan terdaftar untuk wilayah ini.
          </p>
        ) : (
          <>
            {tampil.map((n) => {
              const Icon = CATEGORY_ICON[String(n.category || "").toLowerCase()] || Phone;
              return (
                <div
                  key={n.id}
                  className="flex items-center gap-3 rounded-xl border border-[#17a2b8] bg-white px-3 py-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#17a2b8] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {n.agency_name}
                      {n.distance != null && ` (${formatDistance(n.distance)})`}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.telephone}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCallTarget(n)}
                    aria-label={`Hubungi ${n.agency_name}`}
                    className="w-9 h-9 rounded-full bg-[#17a2b8] flex items-center justify-center shrink-0 transition active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </button>
                </div>
              );
            })}

            {layanan.length > TAMPIL_AWAL && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="w-full py-2 text-xs font-semibold text-[#0d5ab4]"
              >
                {showAll ? "Tampilkan lebih sedikit" : `Tampilkan semua (${layanan.length})`}
              </button>
            )}
          </>
        )}
      </section>

      {/* Dialog konfirmasi sebelum menelepon (atau ke WA saat mode testing) */}
      <CallConfirmDialog target={callTarget} onClose={() => setCallTarget(null)} />
    </div>
  );
}

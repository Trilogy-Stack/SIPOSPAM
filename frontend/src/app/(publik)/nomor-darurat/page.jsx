"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  MapPin,
  Locate,
  Search,
  Flame,
  HeartPulse,
  Shield,
  Fuel,
  Wrench,
} from "lucide-react";
import { getEmergencyApi, NASIONAL } from "@/lib/api";
import RegionSearch from "../components/regionSearch";

// Ikon per kategori (sama dengan halaman kelola nomor darurat di admin; kategori disimpan huruf kecil)
const CATEGORY_ICON = {
  bencana: Flame,
  medis: HeartPulse,
  keamanan: Shield,
  bbm: Fuel,
  bengkel: Wrench,
};

const TAMPIL_AWAL = 5; // jumlah layanan sekitar yang tampil sebelum "Tampilkan semua"

const toNum = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const telHref = (phone) => `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;

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

// Derajat desimal -> derajat, menit, detik. Contoh: 7°23'49.3"S
function toDMS(value, pos, neg) {
  const total = Math.round(Math.abs(value) * 3600 * 10); // persepuluh detik
  const deg = Math.floor(total / 36000);
  const rem = total % 36000;
  const min = Math.floor(rem / 600);
  const sec = ((rem % 600) / 10).toFixed(1);
  return `${deg}°${min}'${sec}"${value >= 0 ? pos : neg}`;
}
const formatCoords = (lat, lng) => `${toDMS(lat, "N", "S")} ${toDMS(lng, "E", "W")}`;

// Kotak ikon instansi; kalau gambar kosong atau gagal dimuat, tampil ikon telepon
// (sama seperti tabel nomor nasional di superadmin)
function NasionalIcon({ src }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="w-[75px] h-[75px] rounded-2xl bg-[#e8ecf4] group-hover:bg-[#dde3ee] flex items-center justify-center p-2 overflow-hidden transition">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <Phone className="w-8 h-8 text-slate-400" />
      )}
    </div>
  );
}

export default function NomorDaruratPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [region, setRegion] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [lokasiLabel, setLokasiLabel] = useState("");
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [locError, setLocError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getEmergencyApi({ limit: 1000 })
      .then((res) => setItems(Array.isArray(res) ? res : res?.data || []))
      .catch((err) => {
        console.error("Gagal ambil nomor darurat:", err);
        setError("Gagal memuat nomor darurat. Coba lagi nanti.");
      })
      .finally(() => setLoading(false));
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

  const availableRegions = useMemo(
    () =>
      Array.from(
        new Set(lokal.map((n) => n.region).filter((r) => r && r.trim() !== "" && r !== "-"))
      ).sort(),
    [lokal]
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

        // Wilayah lokasi pemudik = wilayah layanan terdekat
        let detected = "";
        let min = Infinity;
        lokal.forEach((n) => {
          const d = haversine(coords.lat, coords.lng, n.lat, n.lng);
          if (d !== null && d < min) {
            min = d;
            detected = n.region;
          }
        });

        if (detected) setRegion(detected);
        setLokasiLabel(detected || "Lokasi Anda");
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

        <button
          type="button"
          onClick={handleAktifkanLokasi}
          disabled={isLoadingLoc || loading}
          className="w-full bg-[#0d5ab4] hover:bg-[#0b4f9f] disabled:opacity-70 text-white py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
        >
          {userCoords ? <MapPin className="w-5 h-5" /> : <Locate className="w-5 h-5" />}
          {isLoadingLoc ? "Mendeteksi Lokasi..." : userCoords ? lokasiLabel : "Aktifkan Lokasi"}
        </button>

        {locError && <p className="text-xs text-red-600">{locError}</p>}

        {userCoords && (
          <div className="rounded-xl border border-[#e8ecf4] bg-[#f7f8f9] py-3 text-center text-sm text-slate-800">
            {formatCoords(userCoords.lat, userCoords.lng)}
          </div>
        )}
      </div>

      {/* Nomor nasional: kotak ikon, ketuk untuk menelepon */}
      {loading ? (
        <p className="text-xs text-slate-500 text-center py-6">Memuat...</p>
      ) : (
        nasional.length > 0 && (
          <div className="grid grid-cols-3 justify-items-center gap-y-5 px-2 pt-2">
            {nasional.map((n) => (
              <a
                key={n.id}
                href={telHref(n.telephone)}
                aria-label={`Hubungi ${n.agency_name} (${n.telephone})`}
                title={`${n.agency_name} - ${n.telephone}`}
                className="group flex w-[92px] flex-col items-center gap-1.5 transition active:scale-95"
              >
                <NasionalIcon src={n.icon} />
                <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-slate-700">
                  {n.agency_name}
                </span>
              </a>
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
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      {n.agency_name}
                      {n.distance != null && ` (${formatDistance(n.distance)})`}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.telephone}</p>
                  </div>

                  <a
                    href={telHref(n.telephone)}
                    aria-label={`Hubungi ${n.agency_name}`}
                    className="w-9 h-9 rounded-full bg-[#17a2b8] flex items-center justify-center shrink-0 transition active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </a>
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
    </div>
  );
}
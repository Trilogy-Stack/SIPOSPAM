// src/app/superadmin/dashboard/page.jsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/superadmin/SearchBar";
import StatusIndicator from "@/components/superadmin/StatusIndicator";
import WilayahAccordion from "@/components/superadmin/WilayahAccordion";
import PospamCardList from "@/components/superadmin/PospamCardList";
import EmptyState from "@/components/superadmin/EmptyState";
import { getPospamAll, getAdminList } from "@/lib/api";
import { buildWilayahList } from "@/lib/wilayahData";
import { mockWilayahList } from "@/mocks/wilayah";

// Peta hanya dirender di browser (Leaflet butuh window)
const MapContainer = dynamic(() => import("@/components/shared/map/MapContainer"), { ssr: false });

// true = pakai data dummy (src/mocks/wilayah.js)
const USE_MOCK = false;

const norm = (s) => s.trim().toLowerCase();
const countPospam = (list) => list.reduce((n, w) => n + w.pospam.length, 0);

// Ubah data dummy ke bentuk baris BE
const mockRows = () =>
  mockWilayahList.flatMap((w) =>
    w.pospam.map((p) => ({
      id: p.id,
      name: p.nama,
      region: w.nama,
      location: p.lokasi,
      facility: p.fasilitas,
      koor_phone: p.telepon,
      latitude: p.lat,
      longitude: p.lng,
    }))
  );

export default function SuperadminDashboard() {
  const [wilayahList, setWilayahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Ambil pospam + akun admin (untuk nama polres), lalu kelompokkan per wilayah
  const load = useCallback(async () => {
    setLoadError("");
    try {
      if (USE_MOCK) {
        setWilayahList(buildWilayahList(mockRows(), []));
      } else {
        const [rows, admins] = await Promise.all([
          getPospamAll(),
          getAdminList().catch(() => []),
        ]);
        setWilayahList(buildWilayahList(rows, admins));
      }
    } catch (err) {
      setLoadError(err.message || "Gagal memuat data pospam");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const wilayahOptions = useMemo(() => wilayahList.map((w) => w.nama), [wilayahList]);
  const selectedWilayah = wilayahList.find((w) => w.id === selectedId) ?? null;

  // Hasil pencarian untuk daftar akordeon
  const q = search.toLowerCase();
  const filtered = wilayahList.filter(
    (w) => w.nama.toLowerCase().includes(q) || w.region.toLowerCase().includes(q)
  );

  // Jumlah pospam yang sedang ditampilkan dari total semua wilayah
  const totalPospam = countPospam(wilayahList);
  const currentPospam = countPospam(selectedWilayah ? [selectedWilayah] : filtered);
  const invalidCount = wilayahList.reduce(
    (n, w) => n + w.pospam.filter((p) => !p.valid).length,
    0
  );

  // Wilayah terpilih kalau teks pencarian persis sama dengan namanya
  const handleSearchChange = (value) => {
    setSearch(value);
    const match = wilayahList.find((w) => norm(w.nama) === norm(value));
    setSelectedId(match?.id ?? null);
  };

  // klik poligon/pin di peta kemudian samakan isi search bar
  const handleSelectRegion = (wilayah) => {
    setSelectedId(wilayah?.id ?? null);
    setSearch(wilayah ? wilayah.nama : "");
  };

  return (
    <div className="min-h-screen bg-[#E9ECF6] px-6 py-6 font-poppins">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-xl bg-white px-12 pb-10 pt-6 shadow-sm">
        {/* Pencarian + jumlah pospam */}
        <div className="flex items-center justify-between gap-4">
          <SearchBar value={search} onChange={handleSearchChange} options={wilayahOptions} />
          <StatusIndicator current={currentPospam} total={totalPospam} />
        </div>

        {/* Gagal memuat data */}
        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-center">
            <p className="text-sm text-red-600">{loadError}</p>
            <button
              onClick={() => { setLoading(true); load(); }}
              className="mt-3 rounded-md border border-red-300 px-4 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Peta sebaran pospam */}
        <div className="h-[calc(100vh-260px)] min-h-[480px] overflow-hidden rounded-xl">
          <MapContainer
            wilayahList={wilayahList}
            selectedWilayah={selectedWilayah}
            onSelectRegion={handleSelectRegion}
          />
        </div>

        {/* Koordinat di luar Jateng: tidak digambar di peta, tapi tetap dihitung */}
        {invalidCount > 0 && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {invalidCount} pospam tidak tampil di peta karena koordinatnya berada di luar Jawa
            Tengah. Periksa data latitude/longitude pospam tersebut.
          </p>
        )}

        {/* Daftar pospam: satu wilayah kalau dipilih, semua wilayah kalau tidak */}
        <div className="mt-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">Memuat data pospam...</p>
          ) : wilayahList.length === 0 && !loadError ? (
            <EmptyState message="Belum ada data pospam" />
          ) : selectedWilayah ? (
            <PospamCardList wilayah={selectedWilayah} />
          ) : (
            <WilayahAccordion wilayahList={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
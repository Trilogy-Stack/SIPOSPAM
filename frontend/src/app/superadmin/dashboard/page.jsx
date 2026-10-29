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

const MapContainer = dynamic(() => import("@/components/shared/map/MapContainer"), { ssr: false });

const norm = (s) => s.trim().toLowerCase();
const countPospam = (list) => list.reduce((n, w) => n + w.pospam.length, 0);

export default function SuperadminDashboard() {
  const [wilayahList, setWilayahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const [rows, admins] = await Promise.all([
        getPospamAll(),
        getAdminList().catch(() => []),
      ]);
      setWilayahList(buildWilayahList(rows, admins));
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

  const q = search.toLowerCase();
  const filtered = wilayahList.filter(
    (w) => w.nama.toLowerCase().includes(q) || w.region.toLowerCase().includes(q)
  );

  const totalPospam = countPospam(wilayahList);
  const currentPospam = countPospam(selectedWilayah ? [selectedWilayah] : filtered);
  const invalidCount = wilayahList.reduce(
    (n, w) => n + w.pospam.filter((p) => !p.valid).length,
    0
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    const match = wilayahList.find((w) => norm(w.nama) === norm(value));
    setSelectedId(match?.id ?? null);
  };

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
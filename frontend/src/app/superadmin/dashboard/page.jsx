// src/app/superadmin/dashboard/page.jsx
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/superadmin/SearchBar";
import StatusIndicator from "@/components/superadmin/StatusIndicator";
import WilayahAccordion from "@/components/superadmin/WilayahAccordion";
import PospamCardList from "@/components/superadmin/PospamCardList";
import { mockWilayahList } from "@/mocks/wilayah";

const MapContainer = dynamic(() => import("@/components/shared/map/MapContainer"), { ssr: false });

const wilayahOptions = mockWilayahList.map((w) => w.nama);
const norm = (s) => s.trim().toLowerCase();

export default function SuperadminDashboard() {
  const [search, setSearch] = useState("");
  const [selectedWilayah, setSelectedWilayah] = useState(null);

  const filtered = mockWilayahList.filter((w) =>
    w.nama.toLowerCase().includes(search.toLowerCase())
  );

  // Jumlah pospam: total semua wilayah, dan yang sedang ditampilkan
const countPospam = (list) => list.reduce((n, w) => n + w.pospam.length, 0);
const totalPospam = countPospam(mockWilayahList);
const currentPospam = countPospam(selectedWilayah ? [selectedWilayah] : filtered);

  // Dari search bar (dipilih di dropdown atau diketik lengkap):
  // isi pencarian, dan kalau namanya persis sama dengan satu wilayah,
  // pilih wilayah itu supaya peta terbang ke sana dan daftar pospam tampil.
  // Kalau teks diubah/dikosongkan, pilihan dilepas dan kembali ke tampilan semua wilayah.
  const handleSearchChange = (value) => {
    setSearch(value);
    const match = mockWilayahList.find((w) => norm(w.nama) === norm(value));
    setSelectedWilayah(match ?? null);
  };

  // Dari klik area wilayah di peta: samakan juga isi search bar
  const handleSelectRegion = (wilayah) => {
    setSelectedWilayah(wilayah);
    setSearch(wilayah ? wilayah.nama : "");
  };

  return (
    <div className="min-h-screen bg-[#E9ECF6] px-6 py-6 font-poppins">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-xl bg-white px-12 pb-10 pt-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            options={wilayahOptions}
          />
          <StatusIndicator current={currentPospam} total={totalPospam} />
        </div>

        <div className="h-[calc(100vh-260px)] min-h-[480px] overflow-hidden rounded-xl">
          <MapContainer
            wilayahList={mockWilayahList}
            selectedWilayah={selectedWilayah}
            onSelectRegion={handleSelectRegion}
          />
        </div>

        <div className="mt-4">
          {selectedWilayah ? (
            <PospamCardList wilayah={selectedWilayah} />
          ) : (
            <WilayahAccordion wilayahList={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
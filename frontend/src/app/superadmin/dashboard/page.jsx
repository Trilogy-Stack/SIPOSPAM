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

export default function SuperadminDashboard() {
  const [search, setSearch] = useState("");
  const [selectedWilayah, setSelectedWilayah] = useState(null);

  const filtered = mockWilayahList.filter((w) =>
    w.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#E9ECF6] px-6 py-8 font-poppins">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 rounded-xl bg-white px-12 py-10 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <SearchBar
  value={search}
  onChange={setSearch}
  options={mockWilayahList.map((w) => w.nama)}
/>
          <StatusIndicator current={filtered.length} total={mockWilayahList.length} />
        </div>

        <div className="h-[430px] overflow-hidden rounded-xl">
          <MapContainer
            wilayahList={mockWilayahList}
            selectedWilayah={selectedWilayah}
            onSelectRegion={setSelectedWilayah}
          />
        </div>

        {selectedWilayah ? (
          <PospamCardList wilayah={selectedWilayah} />
        ) : (
          <WilayahAccordion wilayahList={filtered} />
        )}
      </div>
    </div>
  );
}
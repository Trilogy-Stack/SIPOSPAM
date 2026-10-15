// src/components/shared/map/PublikMap.jsx
// Peta untuk halaman publik: titik pospam + titik lokasi pemudik (kalau lokasi diaktifkan).
"use client";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PospamMarker from "./PospamMarker";
import { JATENG_BOUNDS } from "@/lib/mapConfig";

// Saat lokasi aktif, peta dipas-kan ke posisi pemudik + sekian pospam terdekat
// (daftar dari halaman sudah terurut dari yang terdekat)
const NEAREST = 5;

const num = (v) => (v == null || v === "" ? NaN : Number(v));

// Menyesuaikan tampilan setiap kali daftar titik atau posisi pemudik berubah
function FitView({ points, userCoords }) {
  const map = useMap();

  useEffect(() => {
    const shown = userCoords ? points.slice(0, NEAREST) : points;
    const latlngs = shown.map((p) => [p.lat, p.lng]);
    if (userCoords) latlngs.push([userCoords.lat, userCoords.lng]);

    map.invalidateSize();
    if (latlngs.length) {
      map.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30], maxZoom: 15, animate: false });
    } else {
      map.fitBounds(JATENG_BOUNDS);
    }
  }, [map, points, userCoords]);

  return null;
}

const TILES = {
  peta: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  satelit: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics, dan kontributor GIS",
  },
};

export default function PublikMap({ pospams = [], userCoords = null }) {
  const [mode, setMode] = useState("peta"); // "peta" | "satelit"

  // Hanya titik yang koordinatnya valid; PospamMarker membaca nama dari field "nama"
  const points = useMemo(
    () =>
      pospams
        .map((p) => ({ ...p, nama: p.name, lat: num(p.lat), lng: num(p.lng) }))
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [pospams]
  );

  const tile = TILES[mode];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        bounds={JATENG_BOUNDS}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer key={mode} url={tile.url} attribution={tile.attribution} />
        <FitView points={points} userCoords={userCoords} />

        {points.map((p) => (
          <PospamMarker key={p.id} pospam={p} />
        ))}

        {userCoords && (
          <CircleMarker
            center={[userCoords.lat, userCoords.lng]}
            radius={9}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}
          >
            <Popup>Lokasi Anda</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {/* Tombol ganti tampilan, kiri bawah seperti di Google Maps */}
      <button
        type="button"
        onClick={() => setMode((m) => (m === "peta" ? "satelit" : "peta"))}
        className="absolute bottom-6 left-2 z-[1000] rounded-md bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-md ring-1 ring-black/10 hover:bg-slate-50 active:scale-95 transition"
      >
        {mode === "peta" ? "Satelit" : "Peta"}
      </button>
    </div>
  );
}
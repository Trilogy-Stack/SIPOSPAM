// src/components/shared/map/JatengMask.jsx
"use client";
import { Polygon } from "react-leaflet";
import { JATENG_RINGS } from "@/lib/jatengBoundary";

// Persegi besar yang menutup seluruh dunia; daratan Jawa Tengah menjadi "lubang"-nya
const WORLD = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
];

const MASK_COLOR = "#E9ECF6"; // samakan dengan latar halaman
const MASK_OPACITY = 0.50; // 0 = tidak tertutup, 1 = tertutup penuh (hilang)

export default function JatengMask() {
  return (
    <>
      {/* Selubung pudar di luar Jawa Tengah */}
      <Polygon
        positions={[WORLD, ...JATENG_RINGS]}
        interactive={false}
        pathOptions={{ stroke: false, fillColor: MASK_COLOR, fillOpacity: MASK_OPACITY }}
      />
      {/* Garis batas provinsi */}
      <Polygon
        positions={JATENG_RINGS}
        interactive={false}
        pathOptions={{ color: "#1BA3BA", weight: 2, opacity: 0.4, fill: false }}
      />
    </>
  );
}
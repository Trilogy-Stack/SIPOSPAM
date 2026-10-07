// src/components/shared/map/MapContainer.jsx
"use client";
import { useEffect } from "react";
import { MapContainer as LeafletMap, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RegionOverlay from "./RegionOverlay";
import PospamMarker from "./PospamMarker";
import FlyToRegion from "./FlyToRegion";
import { JATENG_BOUNDS, JATENG_PAN_BOUNDS } from "@/lib/mapConfig";
import JatengMask from "./JatengMask";

const PADDING = [10, 10];
const FIT_OPTIONS = { padding: PADDING, animate: false };

// Menjaga tampilan Jawa Tengah:
// - batas zoom-out = tepat satu Jawa Tengah di kotak peta (dihitung ulang tiap ukuran berubah)
// - kalau fit = true (tidak ada wilayah terpilih), peta dipas-kan ke Jawa Tengah
function JatengView({ fit }) {
  const map = useMap();

  useEffect(() => {
    const update = () => {
      map.invalidateSize();
      map.setMinZoom(map.getBoundsZoom(JATENG_BOUNDS, false, PADDING));
      if (fit) map.fitBounds(JATENG_BOUNDS, FIT_OPTIONS);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, fit]);

  return null;
}

export default function MapContainer({ wilayahList = [], selectedWilayah, onSelectRegion }) {
  return (
    <LeafletMap
      bounds={JATENG_BOUNDS}
      boundsOptions={FIT_OPTIONS}
      maxBounds={JATENG_PAN_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={7}
      zoomSnap={0.1}
      zoomDelta={0.5}
      style={{ height: "100%", width: "100%", background: "#E9ECF6" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <JatengMask />
      <JatengView fit={!selectedWilayah} />
      <RegionOverlay regions={wilayahList} onSelect={onSelectRegion} />

      {/* Semua pospam selalu tampil; yang di luar wilayah terpilih dibuat pudar */}
      {wilayahList.flatMap((w) =>
        w.pospam.map((p) => (
          <PospamMarker
            key={p.id}
            pospam={p}
            dimmed={!!selectedWilayah && selectedWilayah.id !== w.id}
            onClick={() => onSelectRegion(w)}
          />
        ))
      )}

      {selectedWilayah && <FlyToRegion bounds={selectedWilayah.bounds} />}
    </LeafletMap>
  );
}
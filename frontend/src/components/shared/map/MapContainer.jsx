// src/components/shared/map/MapContainer.jsx
"use client";
import { useEffect, useState } from "react";
import { MapContainer as LeafletMap, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RegionOverlay from "./RegionOverlay";
import PospamMarker from "./PospamMarker";
import FlyToRegion from "./FlyToRegion";
import JatengMask from "./JatengMask";
import { JATENG_BOUNDS, JATENG_PAN_BOUNDS } from "@/lib/mapConfig";

const PADDING = [10, 10];
const FIT_OPTIONS = { padding: PADDING, animate: false };

// Bentuk detail (garis titik terluar) muncul saat zoom sudah naik sebanyak ini
// dari tampilan seluruh Jawa Tengah. Makin kecil = detail muncul lebih cepat saat zoom in.
const DETAIL_ZOOM_OFFSET = 3;

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

// Memberi tahu induk apakah peta sudah cukup di-zoom untuk menampilkan bentuk detail
function DetailWatcher({ onChange }) {
  const map = useMap();

  useEffect(() => {
    const update = () => onChange(map.getZoom() >= map.getMinZoom() + DETAIL_ZOOM_OFFSET);
    update();
    map.on("zoomend zoomlevelschange resize", update);
    return () => map.off("zoomend zoomlevelschange resize", update);
  }, [map, onChange]);

  return null;
}

export default function MapContainer({ wilayahList = [], selectedWilayah, onSelectRegion }) {
  const [detail, setDetail] = useState(false);

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
      <DetailWatcher onChange={setDetail} />

      {/* Zoom jauh: lingkaran/lonjong per wilayah. Zoom dekat: garis antar titik pospam terluar */}
      <RegionOverlay
        regions={wilayahList}
        onSelect={onSelectRegion}
        selectedId={selectedWilayah?.id ?? null}
        detail={detail}
      />

      {/* Semua pin pospam tampil normal, termasuk yang di luar wilayah terpilih */}
      {wilayahList.flatMap((w) =>
        w.pospam
          .filter((p) => p.valid)
          .map((p) => (
            <PospamMarker
              key={p.id}
              pospam={p}
              onClick={() => onSelectRegion(w)}
            />
          ))
      )}

      {selectedWilayah?.bounds && <FlyToRegion bounds={selectedWilayah.bounds} />}
    </LeafletMap>
  );
}
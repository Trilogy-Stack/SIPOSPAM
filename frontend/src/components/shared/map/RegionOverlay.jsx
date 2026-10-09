// src/components/shared/map/RegionOverlay.jsx
"use client";
import { Polygon, Polyline, Tooltip } from "react-leaflet";

// detail = true  : garis yang menghubungkan titik pospam terluar (zoom dekat)
// detail = false : lingkaran/lonjong penutup sederhana (zoom jauh)
// Berlaku sama untuk semua wilayah, termasuk yang sedang dipilih.
export default function RegionOverlay({ regions, onSelect, selectedId = null, detail = false }) {
  return regions.map((r) => {
    const selected = r.id === selectedId;

    const pathOptions = {
      color: r.color,
      weight: selected ? 3 : 2,
      opacity: 1,
      lineJoin: "round",
      fillColor: r.color,
      fillOpacity: selected ? 0.4 : 0.3,
    };
    const eventHandlers = { click: () => onSelect(r) };
    const tooltip = (
      <Tooltip sticky direction="top">
        {r.nama}
      </Tooltip>
    );

    if (detail) {
      if (r.outline.length >= 3) {
        return (
          <Polygon key={`${r.id}-detail`} positions={r.outline} pathOptions={pathOptions} eventHandlers={eventHandlers}>
            {tooltip}
          </Polygon>
        );
      }
      if (r.outline.length === 2) {
        // dua pospam: cukup garis lurus di antara keduanya
        return (
          <Polyline
            key={`${r.id}-detail`}
            positions={r.outline}
            pathOptions={{ ...pathOptions, weight: selected ? 5 : 4 }}
            eventHandlers={eventHandlers}
          >
            {tooltip}
          </Polyline>
        );
      }
      return null; // satu pospam: cukup marker-nya
    }

    if (r.ellipse.length >= 3) {
      return (
        <Polygon key={`${r.id}-ring`} positions={r.ellipse} pathOptions={pathOptions} eventHandlers={eventHandlers}>
          {tooltip}
        </Polygon>
      );
    }
    return null;
  });
}
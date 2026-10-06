// src/components/shared/map/RegionOverlay.jsx
"use client";
import { Rectangle } from "react-leaflet";

export default function RegionOverlay({ regions, onSelect }) {
  return regions.map((r) => (
    <Rectangle
      key={r.id}
      bounds={r.bounds}
      pathOptions={{ color: r.color, weight: 1.5, fillColor: r.color, fillOpacity: 0.35 }}
      eventHandlers={{ click: () => onSelect(r) }}
    />
  ));
}
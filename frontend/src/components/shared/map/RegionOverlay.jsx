// src/components/shared/map/RegionOverlay.jsx
"use client";
import { useMemo } from "react";
import { Polygon, Polyline, Tooltip } from "react-leaflet";
import { cutShapes } from "@/lib/regionShapes";

// detail = true  : garis yang menghubungkan titik pospam terluar (zoom dekat)
// detail = false : lingkaran/lonjong penutup sederhana (zoom jauh)
// Berlaku sama untuk semua wilayah, termasuk yang sedang dipilih.
// Wilayah kecil memotong (melubangi) wilayah besar yang menumpuknya, supaya semua bisa diklik.
export default function RegionOverlay({ regions, onSelect, selectedId = null, detail = false }) {
  // Poligon yang akan digambar, terurut dari yang terbesar ke terkecil
  const polygons = useMemo(() => {
    const byId = new Map(regions.map((r) => [r.id, r]));
    const items = regions
      .map((r) => ({ id: r.id, ring: detail ? r.outline : r.ellipse }))
      .filter((it) => it.ring.length >= 3);
    return cutShapes(items).map(({ id, positions }) => ({ region: byId.get(id), positions }));
  }, [regions, detail]);

  const styleOf = (r) => {
    const selected = r.id === selectedId;
    return {
      selected,
      pathOptions: {
        color: r.color,
        weight: selected ? 3 : 2,
        opacity: 1,
        lineJoin: "round",
        fillColor: r.color,
        fillOpacity: selected ? 0.4 : 0.3,
      },
    };
  };

  return (
    <>
      {polygons.map(({ region: r, positions }) => (
        <Polygon
          key={`${r.id}-${detail ? "detail" : "ring"}`}
          positions={positions}
          pathOptions={styleOf(r).pathOptions}
          eventHandlers={{ click: () => onSelect(r) }}
        >
          <Tooltip sticky direction="top">
            {r.nama}
          </Tooltip>
        </Polygon>
      ))}

      {/* Dua pospam saja (zoom dekat): cukup garis lurus di antara keduanya, digambar paling atas */}
      {detail &&
        regions
          .filter((r) => r.outline.length === 2)
          .map((r) => {
            const { selected, pathOptions } = styleOf(r);
            return (
              <Polyline
                key={`${r.id}-detail`}
                positions={r.outline}
                pathOptions={{ ...pathOptions, weight: selected ? 5 : 4 }}
                eventHandlers={{ click: () => onSelect(r) }}
              >
                <Tooltip sticky direction="top">
                  {r.nama}
                </Tooltip>
              </Polyline>
            );
          })}
    </>
  );
}
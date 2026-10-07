// src/components/shared/map/PospamMarker.jsx
"use client";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "/markers/pospam-pin.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function PospamMarker({ pospam, dimmed = false, onClick }) {
  return (
    <Marker
      position={[pospam.lat, pospam.lng]}
      icon={icon}
      opacity={dimmed ? 0.45 : 1}
      zIndexOffset={dimmed ? 0 : 1000}
      eventHandlers={onClick ? { click: onClick } : undefined}
    >
      <Popup>{pospam.nama}</Popup>
    </Marker>
  );
}
// src/components/shared/map/PospamMarker.jsx
"use client";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "/markers/pospam-pin.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function PospamMarker({ pospam }) {
  return (
    <Marker position={[pospam.lat, pospam.lng]} icon={icon}>
      <Popup>{pospam.nama}</Popup>
    </Marker>
  );
}
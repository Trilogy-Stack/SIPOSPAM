// src/components/shared/map/MapContainer.jsx
"use client";
import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RegionOverlay from "./RegionOverlay";
import PospamMarker from "./PospamMarker";
import FlyToRegion from "./FlyToRegion";
import { JATENG_BOUNDS } from "@/mocks/wilayah";

export default function MapContainer({ wilayahList = [], selectedWilayah, onSelectRegion }) {
  return (
    <LeafletMap
      bounds={JATENG_BOUNDS}
      maxBounds={JATENG_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={7}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <RegionOverlay regions={wilayahList} onSelect={onSelectRegion} />
      {selectedWilayah?.pospam.map((p) => <PospamMarker key={p.id} pospam={p} />)}
      {selectedWilayah && <FlyToRegion bounds={selectedWilayah.bounds} />}
    </LeafletMap>
  );
}
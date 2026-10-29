"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function FlyToRegion({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.flyToBounds(bounds, { padding: [20, 20] });
  }, [bounds, map]);
  return null;
}
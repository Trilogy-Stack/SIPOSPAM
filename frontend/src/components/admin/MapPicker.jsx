"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { JATENG_BOUNDS } from "@/lib/mapConfig";

const round = (n) => Math.round(n * 1e6) / 1e6;

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`;

// Susun teks jalan/patokan dari hasil reverse geocoding Nominatim
function buildStreetText(data) {
  const a = data?.address || {};
  const road = a.road || a.pedestrian || a.footway || a.path || a.hamlet || "";
  const area = a.village || a.suburb || a.neighbourhood || a.quarter || "";

  const parts = [road, area].filter(Boolean);
  if (parts.length) return parts.join(", ");

  // Cadangan: dua bagian pertama dari alamat lengkap
  return String(data?.display_name || "")
    .split(",")
    .slice(0, 2)
    .map((p) => p.trim())
    .filter(Boolean)
    .join(", ");
}

// Cari nama jalan dari koordinat pin (dipanggil hanya saat pin diatur manual).
function lookupAddress(s, lat, lng) {
  if (!s.onAddress) return;

  clearTimeout(s.addrTimer);
  const token = ++s.addrToken;
  s.setError?.("");

  s.addrTimer = setTimeout(async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=id&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (token !== s.addrToken) return;

      const text = buildStreetText(data);
      if (text) s.onAddress(text);
      else s.setError?.("Nama jalan tidak ditemukan di titik ini. Isi manual pada kolom di atas.");
    } catch {
      if (token === s.addrToken) {
        s.setError?.("Gagal mengambil nama jalan. Isi manual pada kolom di atas.");
      }
    }
  }, 600);
}

// Menaruh atau memindahkan pin
function placeMarker(s, la, ln, pan) {
  const { L, map } = s;
  if (!L || !map) return;

  if (!s.marker) {
    const marker = L.marker([la, ln], {
      draggable: true,
      icon: L.divIcon({
        className: "",
        html: PIN_SVG,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
      }),
    }).addTo(map);

    marker.on("dragend", () => {
      const p = marker.getLatLng();
      const a = round(p.lat);
      const b = round(p.lng);
      s.onChange?.({ lat: a, lng: b });
      lookupAddress(s, a, b);
    });
    s.marker = marker;
  } else {
    s.marker.setLatLng([la, ln]);
  }

  if (pan) map.setView([la, ln], Math.max(map.getZoom(), 16));
}

export default function MapPicker({
  lat,
  lng,
  onChange,
  onAddress,
  focusQuery = "",
  focusFallback = "",
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    L: null,
    map: null,
    marker: null,
    onChange,
    onAddress,
    setError: null,
    addrTimer: null,
    addrToken: 0,
  });
  const focusToken = useRef(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const toNum = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
  const la = toNum(lat);
  const ln = toNum(lng);
  const hasPoint = Number.isFinite(la) && Number.isFinite(ln);

  // Selalu pakai callback terbaru
  useEffect(() => {
    stateRef.current.onChange = onChange;
    stateRef.current.onAddress = onAddress;
    stateRef.current.setError = setError;
  });

  // Inisialisasi peta (sekali)
  useEffect(() => {
    const s = stateRef.current;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      s.L = L;
      const map = L.map(containerRef.current, {
        scrollWheelZoom: true,
      });

      // Tampilan awal: seluruh Jawa Tengah, atau langsung ke pin kalau sedang edit data
      if (hasPoint) map.setView([la, ln], 16);
      else map.fitBounds(JATENG_BOUNDS);

      // ======================================================================
      // TILE LAYERS: OpenStreetMap (jalan) + Esri World Imagery (satelit)
      // ======================================================================
      const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      });

      const esriImagery = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics, dan kontributor GIS",
        }
      );

      // Label nama tempat di atas citra satelit
      const esriLabels = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      );
      const satelit = L.layerGroup([esriImagery, esriLabels]);

      // Tampilan default: OpenStreetMap
      osm.addTo(map);

      // Pilihan layer di pojok kanan atas
      L.control
        .layers(
          {
            "Peta Jalan": osm,
            "Satelit + Nama Tempat": satelit,
          },
          null,
          { position: "topright" }
        )
        .addTo(map);

      map.on("click", (e) => {
        const a = round(e.latlng.lat);
        const b = round(e.latlng.lng);
        placeMarker(s, a, b, false);
        s.onChange?.({ lat: a, lng: b });
        lookupAddress(s, a, b);
      });

      s.map = map;
      if (hasPoint) placeMarker(s, la, ln, false);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      clearTimeout(s.addrTimer);
      s.addrToken++;
      if (s.map) s.map.remove();
      s.map = null;
      s.marker = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan pin kalau lat/lng berubah dari luar
  useEffect(() => {
    const s = stateRef.current;
    if (!ready || !s.map) return;

    if (!hasPoint) {
      if (s.marker) {
        s.marker.remove();
        s.marker = null;
        s.map.fitBounds(JATENG_BOUNDS);
      }
      return;
    }

    const cur = s.marker?.getLatLng();
    if (!cur || Math.abs(cur.lat - la) > 1e-7 || Math.abs(cur.lng - ln) > 1e-7) {
      placeMarker(s, la, ln, true);
    }
  }, [la, ln, hasPoint, ready]);

  // Arahkan peta ke wilayah yang dipilih
  useEffect(() => {
    const s = stateRef.current;
    if (!ready || !s.map || !focusQuery) return;

    const token = ++focusToken.current;

    (async () => {
      for (const q of [focusQuery, focusFallback].filter(Boolean)) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&accept-language=id&q=${encodeURIComponent(q)}`
          );
          const data = await res.json();
          if (token !== focusToken.current) return;
          if (!data.length) continue;

          const r = data[0];
          if (r.boundingbox) {
            const [south, north, west, east] = r.boundingbox.map(Number);
            s.map.fitBounds(s.L.latLngBounds([south, west], [north, east]), {
              maxZoom: 15,
              animate: true,
            });
          } else {
            s.map.setView([parseFloat(r.lat), parseFloat(r.lon)], 14, { animate: true });
          }
          return;
        } catch {
          // coba kata kunci berikutnya
        }
      }
    })();
  }, [focusQuery, focusFallback, ready]);

  return (
    <div className="space-y-2">
      <div className="relative isolate rounded-md overflow-hidden border border-slate-200">
        <div ref={containerRef} className="h-[280px] md:h-[360px] w-full" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <p className="text-xs text-slate-600">
        {hasPoint
          ? `Koordinat: ${la.toFixed(6)}, ${ln.toFixed(6)} (geser pin atau klik peta untuk mengubah)`
          : "Klik peta untuk menaruh pin lokasi, lalu geser pin untuk menyesuaikan."}
      </p>
    </div>
  );
}
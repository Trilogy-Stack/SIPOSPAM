"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Search, LocateFixed } from "lucide-react";

const DEFAULT_CENTER = [-7.3305, 110.5084]; // Salatiga
const round = (n) => Math.round(n * 1e6) / 1e6;

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`;

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
      s.onChange?.({ lat: round(p.lat), lng: round(p.lng) });
    });
    s.marker = marker;
  } else {
    s.marker.setLatLng([la, ln]);
  }

  if (pan) map.setView([la, ln], Math.max(map.getZoom(), 16));
}

export default function MapPicker({ lat, lng, onChange, focusQuery = "", focusFallback = "" , searchRequest = null }) {
  const containerRef = useRef(null);
  const stateRef = useRef({ L: null, map: null, marker: null, onChange });
  const focusToken = useRef(0);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toNum = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
  const la = toNum(lat);
  const ln = toNum(lng);
  const hasPoint = Number.isFinite(la) && Number.isFinite(ln);

  // Selalu pakai onChange terbaru
  useEffect(() => {
    stateRef.current.onChange = onChange;
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
        center: hasPoint ? [la, ln] : DEFAULT_CENTER,
        zoom: hasPoint ? 16 : 13,
        scrollWheelZoom: false, // supaya scroll halaman tidak tersangkut di peta
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      map.on("click", (e) => {
        const a = round(e.latlng.lat);
        const b = round(e.latlng.lng);
        placeMarker(s, a, b, false);
        s.onChange?.({ lat: a, lng: b });
      });

      s.map = map;
      if (hasPoint) placeMarker(s, la, ln, false);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (s.map) s.map.remove();
      s.map = null;
      s.marker = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pindahkan peta ke jalan/patokan yang dicari (pin tidak ditaruh otomatis)
useEffect(() => {
  const s = stateRef.current;
  if (!ready || !s.map || !searchRequest?.queries?.length) return;

  const token = ++focusToken.current;
  setError("");

  (async () => {
    for (const q of searchRequest.queries) {
      try {
        const r = await geocode(q);
        if (token !== focusToken.current) return;
        if (!r) continue;

        if (r.boundingbox) {
          const [south, north, west, east] = r.boundingbox.map(Number);
          s.map.fitBounds(s.L.latLngBounds([south, west], [north, east]), {
            maxZoom: 17,
            animate: true,
          });
        } else {
          s.map.setView([parseFloat(r.lat), parseFloat(r.lon)], 17, { animate: true });
        }
        return;
      } catch {
        // coba kata kunci berikutnya
      }
    }
    if (token === focusToken.current) {
      setError("Jalan/patokan tidak ditemukan di peta. Klik peta untuk menentukan titik secara manual.");
    }
  })();
}, [searchRequest, ready]);

  // Sinkronkan pin kalau lat/lng berubah dari luar (misalnya saat buka data edit)
useEffect(() => {
  const s = stateRef.current;
  if (!ready || !s.map) return;

  if (!hasPoint) {
    if (s.marker) {
      s.marker.remove();
      s.marker = null;
      s.map.setView(DEFAULT_CENTER, 13); // form dikosongkan → peta kembali ke posisi awal
    }
    return;
  }

  const cur = s.marker?.getLatLng();
  if (!cur || Math.abs(cur.lat - la) > 1e-7 || Math.abs(cur.lng - ln) > 1e-7) {
    placeMarker(s, la, ln, true);
  }
}, [la, ln, hasPoint, ready]);

// Arahkan peta ke wilayah yang dipilih (kecamatan, lalu cadangan kab/kota)
useEffect(() => {
  const s = stateRef.current;
  if (!ready || !s.map || !focusQuery) return;

  const token = ++focusToken.current; // abaikan hasil lama jika pilihan berubah cepat

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

  const goTo = (a, b) => {
    placeMarker(stateRef.current, a, b, true);
    onChange({ lat: round(a), lng: round(b) });
  };

  // Cari nama tempat (Nominatim / OpenStreetMap)
  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (!data.length) setError("Lokasi tidak ditemukan.");
      else goTo(parseFloat(data[0].lat), parseFloat(data[0].lon));
    } catch {
      setError("Gagal mencari lokasi. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return setError("Browser tidak mendukung lokasi.");
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => goTo(pos.coords.latitude, pos.coords.longitude),
      () => setError("Tidak bisa mengambil lokasi. Izinkan akses lokasi di browser."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* Cari lokasi */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // cegah submit form utama
              handleSearch();
            }
          }}
          placeholder="Cari tempat, misalnya Pasar Sapi Salatiga"
          className="flex-1 min-w-0 border border-slate-200 rounded-md px-3 py-2 text-xs md:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1a9fb8]"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={busy}
          className="bg-[#1a9fb8] hover:bg-[#158aa0] disabled:opacity-50 text-white rounded-md px-3 flex items-center"
          title="Cari"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleLocate}
          className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-3 flex items-center"
          title="Gunakan lokasi saya"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Peta ("isolate" agar layer Leaflet tidak menutupi dropdown/dialog lain) */}
      <div className="relative isolate rounded-md overflow-hidden border border-slate-200">
        <div ref={containerRef} className="h-[280px] md:h-[360px] w-full" />
      </div>

      <p className="text-xs text-slate-600">
        {hasPoint
          ? `Koordinat: ${la.toFixed(6)}, ${ln.toFixed(6)} (geser pin atau klik peta untuk mengubah)`
          : "Klik peta atau cari tempat untuk menaruh pin lokasi."}
      </p>
    </div>
  );
}
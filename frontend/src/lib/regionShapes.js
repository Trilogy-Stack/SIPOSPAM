// src/lib/regionShapes.js
// Menyusun bentuk poligon wilayah supaya tidak saling menumpuk:
// wilayah yang lebih kecil MEMOTONG (melubangi) wilayah yang lebih besar yang menumpuknya.
// Contoh: Kota Salatiga yang berada di tengah Kabupaten Semarang membuat Kabupaten Semarang
// berlubang di area Salatiga, jadi Salatiga bisa diklik dan warnanya tidak bertumpuk.
//
// Membutuhkan paket:  npm install polygon-clipping
import polygonClipping from "polygon-clipping";

// [[lat, lng], ...] -> cincin tertutup [[lng, lat], ...] (format polygon-clipping)
const toClosedXY = (ring) => {
  const xy = ring.map(([lat, lng]) => [lng, lat]);
  xy.push(xy[0]);
  return xy;
};

// [[lng, lat], ...] -> [[lat, lng], ...] (format Leaflet)
const toLatLng = (ring) => ring.map(([lng, lat]) => [lat, lng]);

// Luas (rumus shoelace) dan kotak pembatas dari cincin tertutup
function measure(xy) {
  let sum = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < xy.length - 1; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[i + 1];
    sum += x1 * y2 - x2 * y1;
    minX = Math.min(minX, x1);
    maxX = Math.max(maxX, x1);
    minY = Math.min(minY, y1);
    maxY = Math.max(maxY, y1);
  }
  return { area: Math.abs(sum) / 2, minX, minY, maxX, maxY };
}

const boxesOverlap = (a, b) =>
  a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY;

// items: [{ id, ring: [[lat, lng], ...] }]  (ring dengan >= 3 titik)
// Hasil: [{ id, positions }] urut dari yang terbesar ke terkecil (yang kecil digambar paling atas).
// positions siap dipakai <Polygon>: satu poligon [luar, lubang...] atau banyak poligon kalau terpecah.
export function cutShapes(items) {
  const shapes = items
    .map((it) => {
      const xy = toClosedXY(it.ring);
      return { id: it.id, xy, ...measure(xy) };
    })
    .sort((a, b) => b.area - a.area);

  const result = [];
  shapes.forEach((s, i) => {
    // wilayah yang lebih kecil dan kotaknya bersinggungan dengan s akan memotong s
    const cutters = shapes.slice(i + 1).filter((t) => boxesOverlap(s, t));

    let multi = [[s.xy]]; // MultiPolygon: [ poligon: [ cincin ] ]
    if (cutters.length) {
      try {
        multi = polygonClipping.difference([s.xy], ...cutters.map((t) => [t.xy]));
      } catch (err) {
        // kalau pemotongan gagal, tetap gambar bentuk utuh agar peta tidak kosong
        console.warn("Pemotongan poligon gagal, memakai bentuk utuh:", s.id, err);
      }
    }
    if (!multi.length) return; // seluruhnya tertutup wilayah yang lebih kecil

    const positions =
      multi.length === 1 ? multi[0].map(toLatLng) : multi.map((poly) => poly.map(toLatLng));
    result.push({ id: s.id, positions });
  });

  return result;
}
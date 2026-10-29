const M_PER_DEG_LAT = 111320;

function makeProjection(points) {
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const lng0 = points.reduce((s, p) => s + p.lng, 0) / points.length;
  const kx = M_PER_DEG_LAT * Math.cos((lat0 * Math.PI) / 180);
  const ky = M_PER_DEG_LAT;
  return {
    toXY: (p) => [(p.lng - lng0) * kx, (p.lat - lat0) * ky],
    toLatLng: ([x, y]) => [lat0 + y / ky, lng0 + x / kx],
  };
}

const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;

  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function segmentsCross(p1, p2, p3, p4) {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function inTriangle(p, a, b, c) {
  const d1 = cross(a, b, p);
  const d2 = cross(b, c, p);
  const d3 = cross(c, a, p);
  return (d1 > 0 && d2 > 0 && d3 > 0) || (d1 < 0 && d2 < 0 && d3 < 0);
}

function meanNearestDistance(pts) {
  let sum = 0;
  for (const p of pts) {
    let best = Infinity;
    for (const q of pts) if (q !== p) best = Math.min(best, dist(p, q));
    sum += best;
  }
  return sum / pts.length;
}

// ---------- Garis keliling titik terluar ----------
// Mulai dari convex hull (titik terluar), lalu sisi yang terlalu panjang "digali" ke dalam
// lewat titik pospam terdekat, sehingga garis mengikuti sebaran titik (boleh cekung).
// Setiap penggalian dijaga supaya: tidak ada titik yang tertinggal di luar garis,
// dan garis tidak saling berpotongan.
//   concavity: sisi dengan panjang > concavity x jarak antar-pospam rata-rata akan digali.
//              Makin kecil = makin mengikuti titik (zigzag), makin besar = makin mendekati convex hull.
function concaveHull(pts, concavity) {
  let hull = convexHull(pts);
  if (hull.length < 3 || pts.length <= hull.length) return hull;

  const maxEdge = concavity * meanNearestDistance(pts);
  const onHull = new Set(hull);

  for (let guard = 0; guard < pts.length; guard++) {
    // sisi terpanjang lebih dulu
    const edges = hull
      .map((a, i) => ({ i, a, b: hull[(i + 1) % hull.length] }))
      .map((e) => ({ ...e, len: dist(e.a, e.b) }))
      .filter((e) => e.len > maxEdge)
      .sort((x, y) => y.len - x.len);

    let dug = false;
    for (const { i, a, b, len } of edges) {
      let best = null;
      let bestScore = Infinity;

      for (const p of pts) {
        if (onHull.has(p)) continue;
        if (dist(a, p) >= len || dist(p, b) >= len) continue;
        // titik harus berada di sisi dalam sisi a-b
        if (cross(a, b, p) <= 0) continue;
        // segitiga a-p-b tidak boleh memuat titik lain (kalau ada, titik itu akan tertinggal di luar)
        if (pts.some((q) => q !== p && q !== a && q !== b && inTriangle(q, a, p, b))) continue;
        // sisi baru a-p dan p-b tidak boleh memotong sisi lain
        let crossing = false;
        for (let j = 0; j < hull.length && !crossing; j++) {
          const c = hull[j];
          const d = hull[(j + 1) % hull.length];
          if (c === a && d === b) continue;
          if (segmentsCross(a, p, c, d) || segmentsCross(p, b, c, d)) crossing = true;
        }
        if (crossing) continue;

        const score = dist(a, p) + dist(p, b); // titik paling dekat ke sisi a-b
        if (score < bestScore) {
          bestScore = score;
          best = p;
        }
      }

      if (best) {
        hull = [...hull.slice(0, i + 1), best, ...hull.slice(i + 1)];
        onHull.add(best);
        dug = true;
        break;
      }
    }
    if (!dug) break;
  }
  return hull;
}

export function buildOutline(points, concavity = 2.5) {
  if (!points.length) return [];
  const { toXY, toLatLng } = makeProjection(points);

  // buang titik kembar
  const seen = new Set();
  const pts = [];
  for (const p of points) {
    const xy = toXY(p);
    const key = `${xy[0].toFixed(1)}|${xy[1].toFixed(1)}`;
    if (!seen.has(key)) {
      seen.add(key);
      pts.push(xy);
    }
  }

  const hull = pts.length < 3 ? pts : concaveHull(pts, concavity);
  return hull.map(toLatLng);
}

// ---------- Lingkaran/lonjong penutup (untuk zoom jauh) ----------
// Sumbu panjang mengikuti arah sebaran titik, jadi wilayah yang titiknya memanjang menjadi lonjong,
// wilayah yang titiknya menyebar rata atau cuma satu titik menjadi hampir bulat.
//   marginRatio : pembesaran dari ukuran minimum yang pas menutupi semua titik
//   minRadiusM  : jari-jari minimum (meter) supaya wilayah kecil tetap terlihat saat zoom jauh
//   maxAspect   : batas kelonjongan (sumbu panjang : sumbu pendek), supaya tidak jadi jarum
export function buildEllipse(points, { marginRatio = 1.15, minRadiusM = 5000, maxAspect = 3, steps = 48 } = {}) {
  if (!points.length) return [];
  const { toXY, toLatLng } = makeProjection(points);
  const pts = points.map(toXY);

  // arah sumbu utama dari kovarian titik (pusat proyeksi = rata-rata titik, jadi sudah terpusat)
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pts) {
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
  }

  // koordinat tiap titik pada sumbu panjang (u) dan sumbu pendek (v) untuk sudut theta
  const frame = (theta) => {
    const ux = Math.cos(theta), uy = Math.sin(theta);
    const uv = pts.map(([x, y]) => [x * ux + y * uy, -x * uy + y * ux]);
    const us = uv.map((p) => p[0]);
    const vs = uv.map((p) => p[1]);
    const [minU, maxU, minV, maxV] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
    return { ux, uy, uv, cu: (minU + maxU) / 2, cv: (minV + maxV) / 2, ru: (maxU - minU) / 2, rv: (maxV - minV) / 2 };
  };

  let theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  let f = frame(theta);
  if (f.rv > f.ru) f = frame((theta += Math.PI / 2)); // pastikan u adalah sisi yang lebih panjang

  // Sumbu panjang minimal minRadiusM. Sumbu pendek boleh menyusut sampai separuh minRadiusM
  // kalau sebarannya memang memanjang; satu titik tetap lingkaran. Tidak boleh lebih tipis dari 1/maxAspect.
  const t = Math.min(f.ru / minRadiusM, 1);
  let a = Math.max(f.ru, minRadiusM);
  let b = Math.max(f.rv, minRadiusM * (1 - 0.5 * t), a / maxAspect);

  // perbesar sampai semua titik pasti berada di dalam elips
  const k = Math.sqrt(Math.max(...f.uv.map(([u, v]) => ((u - f.cu) / a) ** 2 + ((v - f.cv) / b) ** 2)));
  const scale = Math.max(k, 1) * marginRatio;
  a *= scale;
  b *= scale;

  const ring = [];
  for (let i = 0; i < steps; i++) {
    const ang = (2 * Math.PI * i) / steps;
    const u = f.cu + a * Math.cos(ang);
    const v = f.cv + b * Math.sin(ang);
    ring.push(toLatLng([u * f.ux - v * f.uy, u * f.uy + v * f.ux]));
  }
  return ring;
}

// Kotak pembatas [[selatan, barat], [utara, timur]] dari daftar [lat, lng]; dipakai untuk terbang ke wilayah.
// minHalfSpan (derajat) menjaga kotak tidak nol saat hanya ada satu titik, supaya zoom tidak terlalu dekat.
export function boundsOf(latlngs, minHalfSpan = 0.015) {
  if (!latlngs.length) return null;
  let s = Infinity, w = Infinity, n = -Infinity, e = -Infinity;
  for (const [lat, lng] of latlngs) {
    if (lat < s) s = lat;
    if (lat > n) n = lat;
    if (lng < w) w = lng;
    if (lng > e) e = lng;
  }
  const midLat = (s + n) / 2;
  const midLng = (w + e) / 2;
  const halfLat = Math.max((n - s) / 2, minHalfSpan);
  const halfLng = Math.max((e - w) / 2, minHalfSpan);
  return [
    [midLat - halfLat, midLng - halfLng],
    [midLat + halfLat, midLng + halfLng],
  ];
}
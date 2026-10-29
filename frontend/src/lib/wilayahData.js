// Mengubah data BE (pospam + akun admin) menjadi daftar wilayah yang dipakai dashboard.
import { JATENG_BOUNDS } from "@/lib/mapConfig";
import { buildOutline, buildEllipse, boundsOf } from "@/lib/coverage";

const PALETTE = [
  "#1C7293", "#2E8B57", "#C9A227", "#B5574D", "#6A4C93", "#3A7CA5",
  "#D9822B", "#4C9F70", "#A23B72", "#5B8E7D", "#8D6A9F", "#C0563B",
];

// Titik valid = angka dan berada di dalam Jawa Tengah
function inJateng(lat, lng) {
  const [[s, w], [n, e]] = JATENG_BOUNDS;
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= s && lat <= n && lng >= w && lng <= e;
}

export function buildWilayahList(rows = [], admins = []) {
  const namaByRegion = new Map();
  for (const a of admins) {
    if (a.role === "super_admin" || !a.region || !a.name) continue;
    if (!namaByRegion.has(a.region) || a.is_active !== false) namaByRegion.set(a.region, a.name);
  }

  const inactiveRegions = new Set(
    admins
      .filter((a) => a.role !== "super_admin" && a.region && a.is_active === false)
      .map((a) => a.region)
  );

  const groups = new Map();
  for (const r of rows) {
    if (!r.region || inactiveRegions.has(r.region)) continue;
    const lat = Number(r.latitude);
    const lng = Number(r.longitude);
    const pospam = {
      id: r.id,
      nama: r.name,
      lokasi: r.location ?? "",
      area: r.area ?? "",
      fasilitas: Array.isArray(r.facility) ? r.facility : [],
      koordinator: r.koor_name || "-",
      telepon: r.koor_phone || "-",
      lat,
      lng,
      valid: inJateng(lat, lng),
    };
    if (!groups.has(r.region)) groups.set(r.region, []);
    groups.get(r.region).push(pospam);
  }

  const colorIndex = new Map([...groups.keys()].sort().map((region, i) => [region, i]));

  return [...groups.entries()]
    .map(([region, pospam]) => {
      const valid = pospam.filter((p) => p.valid);
      return {
        id: region,
        region,
        nama: namaByRegion.get(region) ?? region,
        color: PALETTE[colorIndex.get(region) % PALETTE.length],
        pospam,
        outline: buildOutline(valid), 
        ellipse: buildEllipse(valid), 
        bounds: boundsOf(valid.map((p) => [p.lat, p.lng])), 
      };
    })
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
}
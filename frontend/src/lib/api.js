// src/lib/api.js
// ⚠️ ASUMSI: prefix endpoint di backend adalah /api/... (cek backend/src/routes/index.js
//    punya rekanmu — kalau ternyata beda, cukup ubah BASE_URL di bawah)
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("sb-access-token") : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Request gagal (${res.status})`);
  return json.data;
}

// --- Auth ---
export const getMe = () => request("/api/auth/me");

// --- Kelola Admin (Superadmin) ---
export const getAdminList = (q = "") =>
  request(`/api/admin${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const createAdmin = (data) =>
  request("/api/admin", { method: "POST", body: JSON.stringify(data) });
export const updateAdmin = (id, data) =>
  request(`/api/admin/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdmin = (id) =>
  request(`/api/admin/${id}`, { method: "DELETE" });

// --- Wilayah ---
export const getWilayahList = () => request("/api/wilayah");

// --- Nomor Nasional ---
export const getNomorNasionalPublic = () => request("/api/nomor-nasional");
export const getNomorNasionalAll = () => request("/api/nomor-nasional/semua");
export const createNomorNasional = (data) =>
  request("/api/nomor-nasional", { method: "POST", body: JSON.stringify(data) });
export const updateNomorNasional = (id, data) =>
  request(`/api/nomor-nasional/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteNomorNasional = (id) =>
  request(`/api/nomor-nasional/${id}`, { method: "DELETE" });

// --- POSPAM ---
export const getPospamsApi = () => request("/api/pospam");
export const createPospam = (data) =>
  request("/api/pospam", { method: "POST", body: JSON.stringify(data) });
export const updatePospam = (id, data) =>
  request(`/api/pospam/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deletePospam = (id) =>
  request(`/api/pospam/${id}`, { method: "DELETE" });

// --- Nomor Darurat / Emergency ---
export const getEmergencyApi = () => request("/api/emergency");
export const createEmergency = (data) =>
  request("/api/emergency", { method: "POST", body: JSON.stringify(data) });
export const updateEmergency = (id, data) =>
  request(`/api/emergency/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteEmergency = (id) =>
  request(`/api/emergency/${id}`, { method: "DELETE" });
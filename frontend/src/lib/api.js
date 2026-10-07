// src/lib/api.js
// ⚠️ ASUMSI: prefix endpoint di backend adalah /api/... (cek backend/src/routes/index.js
//    punya rekanmu — kalau ternyata beda, cukup ubah BASE_URL di bawah)
// src/lib/api.js
import { createClient } from "./supabase";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session login tidak ditemukan. Silakan login kembali.");
  }

  // Jangan paksa Content-Type untuk FormData: browser harus mengisinya sendiri (multipart + boundary)
  const isForm = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(
      `Response backend [${res.status}] ${options.method || "GET"} ${path}:`,
      JSON.stringify(json, null, 2)
    );
    const detail = Array.isArray(json.detail)
      ? json.detail.map((d) => `${d.field}: ${d.pesan}`).join(", ")
      : json.error_message || "";
    throw new Error(
      [json.message || `Request gagal (${res.status})`, detail].filter(Boolean).join(" - ")
    );
  }

  // Response upload berbentuk { message, url } (tanpa key "data")
  return json.data !== undefined ? json.data : json;
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
export const getPospamsApi = () => request("/api/pospam?limit=100"); // sesuaikan batas max di `paging`
export const createPospam = (data) =>
  request("/api/pospam", { method: "POST", body: JSON.stringify(data) });
export const updatePospam = (id, data) =>
  request(`/api/pospam/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePospam = (id) =>
  request(`/api/pospam/${id}`, { method: "DELETE" });

export const uploadFotoPospam = async (file) => {
  const fd = new FormData();
  fd.append("photo", file); // harus "photo", sesuai upload.single("photo")
  const res = await request("/api/pospam/upload", { method: "POST", body: fd });
  return res.url;
};

// --- Nomor Darurat / Emergency ---
export const getEmergencyApi = () => request("/api/nomor-darurat?limit=100");
export const createEmergency = (data) =>
  request("/api/nomor-darurat", { method: "POST", body: JSON.stringify(data) });
export const updateEmergency = (id, data) =>
  request(`/api/nomor-darurat/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteEmergency = (id) =>
  request(`/api/nomor-darurat/${id}`, { method: "DELETE" });
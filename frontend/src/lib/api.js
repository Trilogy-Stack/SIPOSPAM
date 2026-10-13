// src/lib/api.js
import { createClient } from "./supabase";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// options.requireAuth (default true, perilaku sama seperti sebelumnya).
// Set false untuk endpoint publik (halaman pemudik) agar tidak dipaksa ke /login.
async function request(path, options = {}) {
  const { requireAuth = true, ...fetchOptions } = options;

  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token && requireAuth) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session login tidak ditemukan. Silakan login kembali.");
  }

  // Jangan paksa Content-Type untuk FormData: browser harus mengisinya sendiri (multipart + boundary)
  const isForm = fetchOptions.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(
  `Response backend [${res.status}] ${options.method || "GET"} ${path}:`,
  JSON.stringify(json, null, 2),
  "\nBody dikirim:",
  options.body
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
  request(`/api/admin/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAdmin = (id) =>
  request(`/api/admin/${id}`, { method: "DELETE" });

// --- Wilayah (GET publik) ---
export const getWilayahList = () => request("/api/wilayah", { requireAuth: false });

// --- Nomor Nasional = tabel nomor_darurat dengan region "NASIONAL" ---
export const NASIONAL = "NASIONAL";

// GET publik; limit maksimal di BE = 1000
export const getNomorNasionalAll = () =>
  request(`/api/nomor-darurat?region=${NASIONAL}&limit=100`, { requireAuth: false });
export const getNomorNasionalPublic = getNomorNasionalAll; // alias lama, jaga-jaga masih dipakai

export const createNomorNasional = (data) =>
  request("/api/nomor-darurat", {
    method: "POST",
    body: JSON.stringify({ ...data, region: NASIONAL }),
  });
export const updateNomorNasional = (id, data) =>
  request(`/api/nomor-darurat/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteNomorNasional = (id) =>
  request(`/api/nomor-darurat/${id}`, { method: "DELETE" });

// ======================================================================
// --- POSPAM (dari BE) ---
// ======================================================================
export const getPospamsApi = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/pospam${qs ? `?${qs}` : ""}`, { requireAuth: false }); // GET publik
};
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

// Ambil semua pospam secara bertahap (GET publik)
export async function getPospamAll() {
  const limit = 100;
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const rows = await request(`/api/pospam?page=${page}&limit=${limit}`, {
      requireAuth: false,
    });
    all.push(...rows);
    if (rows.length < limit) break;
  }
  return all;
}

// ======================================================================
// --- Nomor Darurat / Emergency ---
// ======================================================================
export const getEmergencyApi = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/nomor-darurat${qs ? `?${qs}` : ""}`, { requireAuth: false }); // GET publik
};
export const createEmergency = (data) =>
  request("/api/nomor-darurat", { method: "POST", body: JSON.stringify(data) });
export const updateEmergency = (id, data) =>
  request(`/api/nomor-darurat/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteEmergency = (id) =>
  request(`/api/nomor-darurat/${id}`, { method: "DELETE" });
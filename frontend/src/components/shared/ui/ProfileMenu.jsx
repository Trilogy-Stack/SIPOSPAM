// src/components/shared/ui/ProfileMenu.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { profile, logout } = useAuth();

  // Tutup dropdown jika klik di luar area menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Cek role pengguna sesuai enum/string di database
  const isSuperAdmin = profile?.role === "super_admin";
  const isAdminWilayah = profile?.role === "admin_wilayah";

  // 2. Nama tampilan: utamakan kolom `name` dari tabel profiles,
  //    kalau kosong baru pakai fallback berdasarkan role
  const name =
    profile?.name ||
    (isSuperAdmin
      ? "Superadmin"
      : isAdminWilayah
      ? profile?.region ? `Admin ${profile.region}` : "Admin Wilayah"
      : profile?.email?.split("@")[0] || "User");

  const initial = name.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative ml-auto shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded pl-2 pr-3 py-1.5"
      >
        <span className="w-7 h-7 rounded-full bg-sky-400 text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initial}
        </span>
        <span className="max-w-[260px] truncate text-sm font-medium" title={name}>
          {name}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 min-w-full bg-white text-gray-700 rounded shadow-lg overflow-hidden z-50">
          <button
            onClick={() => {
              /* TODO: alur lupa password */
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-left"
          >
            <KeyRound size={16} /> Lupa Password
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-left text-red-600"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}
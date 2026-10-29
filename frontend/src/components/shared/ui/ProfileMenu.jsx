"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SendResetLinkDialog from "./SendResetLinkDialog";

export default function ProfileMenu({ mobile = false }) {
  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
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

  const isSuperAdmin = profile?.role === "super_admin";
  const isAdminWilayah = profile?.role === "admin_wilayah";

  const name =
    profile?.name ||
    (isSuperAdmin
      ? "Superadmin"
      : isAdminWilayah
      ? profile?.region ? `Admin ${profile.region}` : "Admin Wilayah"
      : profile?.email?.split("@")[0] || "User");

  const initial = name.charAt(0).toUpperCase();

  return (
    <div ref={ref} className={`relative shrink-0 ${mobile ? "w-full" : "ml-auto"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded pl-2 pr-3 py-1.5 ${
          mobile ? "w-full" : ""
        }`}
      >
        <span className="w-7 h-7 rounded-full bg-sky-400 text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initial}
        </span>
        <span
          className={`truncate text-sm font-medium ${
            mobile ? "flex-1 text-left" : "max-w-[160px] xl:max-w-[260px]"
          }`}
          title={name}
        >
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
        <div
          className={`${
            mobile ? "mt-2 w-full" : "absolute right-0 mt-2 w-48 min-w-full"
          } bg-white text-gray-700 rounded shadow-lg overflow-hidden z-50`}
        >
          <button
            onClick={() => {
              setOpen(false);
              setPwOpen(true);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-left"
          >
            <KeyRound size={16} /> Ganti Password
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-left text-red-600"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      )}

      {/* Ganti password lewat link yang dikirim ke email akun */}
      <SendResetLinkDialog
        open={pwOpen}
        email={profile?.email}
        onClose={() => setPwOpen(false)}
      />
    </div>
  );
}
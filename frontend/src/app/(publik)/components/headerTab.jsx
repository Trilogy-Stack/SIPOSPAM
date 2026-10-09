"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function HeaderTab() {
  const pathname = usePathname();

  // Cek tab mana yang sedang aktif berdasarkan URL
  const isPospam = pathname.includes("/pospam") || pathname === "/";
  const isDarurat = pathname.includes("/nomor-darurat");

  return (
    <header className="bg-[#2c3e50] text-white sticky top-0 z-30 shadow-md">
      {/* Header Banner Logo SIPOSPAM */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div>
          <h1 className="font-extrabold text-lg tracking-wider text-cyan-400 leading-none">
            SIPOSPAM
          </h1>
          <p className="text-[9px] text-slate-300 font-light mt-0.5">
            Sistem Informasi Pos Pelayanan & Pengamanan
          </p>
        </div>
        <Image
          src="/icons_location.png"
          alt="Logo Polisi"
          width={36}
          height={36}
          className="object-contain"
        />
      </div>

      {/* Tab Navigasi (Pospam Terdekat vs Nomor Darurat) */}
      <div className="flex p-2 bg-slate-100 gap-2">
        <Link
          href="/pospam"
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition ${
            isPospam
              ? "bg-amber-400 text-slate-900 shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-200"
          }`}
        >
          Pospam Terdekat
        </Link>

        <Link
          href="/nomor-darurat"
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition ${
            isDarurat
              ? "bg-amber-400 text-slate-900 shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-200"
          }`}
        >
          Nomor Darurat
        </Link>
      </div>
    </header>
  );
}
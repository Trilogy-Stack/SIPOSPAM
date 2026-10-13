"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Logo SIPOSPAM, sama dengan yang di Navbar admin/superadmin
function Logo() {
  return (
    <Link
      href="/"
      aria-label="SIPOSPAM"
      className="inline-flex shrink-0 flex-col items-stretch leading-none"
    >
      <span className="flex justify-center text-2xl font-extrabold leading-[0.85] tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]">
        <span className="text-[#2BA3B8]">SI</span>
        <span className="text-white">POSPAM</span>
      </span>
      <span className="mt-0.5 block w-0 min-w-full [container-type:inline-size]">
        <span className="flex items-center justify-center whitespace-nowrap rounded-full bg-white px-[4cqw] pt-[1.8cqw] pb-[1.2cqw] text-[length:4cqw] font-medium leading-none text-gray-800">
          Sistem Informasi Pos Pelayanan &amp; Pengamanan
        </span>
      </span>
    </Link>
  );
}

export default function HeaderTab() {
  const pathname = usePathname();

  // Cek tab mana yang sedang aktif berdasarkan URL
  const isPospam = pathname.includes("/pospam") || pathname === "/";
  const isDarurat = pathname.includes("/nomor-darurat");

  return (
    <header className="bg-[#3F5F6B] text-white sticky top-0 z-30 shadow-md">
      {/* Banner: logo SIPOSPAM di kiri, logo Polda Jawa Tengah di kanan */}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <Image
          src="/icons/logo-polda-jateng.png"
          alt="Logo Polda Jawa Tengah"
          width={40}
          height={48}
          priority
          className="h-12 w-auto shrink-0 object-contain"
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
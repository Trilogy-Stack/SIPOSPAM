"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function Logo() {
  return (
    <Link
      href="/"
      aria-label="SIPOSPAM"
      className="inline-flex shrink-0 flex-col items-stretch leading-none"
    >
      <span className="flex justify-start text-2xl md:text-3xl font-extrabold leading-[0.85] tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]">
        <span className="text-[#2BA3B8]">SI</span>
        <span className="text-white">POSPAM</span>
      </span>
      <span className="mt-1 block w-0 min-w-full [container-type:inline-size]">
        <span className="flex items-center justify-center whitespace-nowrap rounded-full bg-white px-[4cqw] pt-[1.8cqw] pb-[1.2cqw] text-[length:3.8cqw] md:text-[length:3.2cqw] font-medium leading-none text-gray-800">
          Sistem Informasi Pos Pelayanan &amp; Pengamanan
        </span>
      </span>
    </Link>
  );
}

export default function HeaderTab() {
  const pathname = usePathname();

  const isPospam = pathname.includes("/pospam") || pathname === "/";
  const isDarurat = pathname.includes("/nomor-darurat");

  const handleOpen110 = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-110-modal"));
    }
  };

  return (
    <header className="bg-[#3F5F6B] text-white sticky top-0 z-30 shadow-md md:shadow-none w-full">
      {/* Banner Logo */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 md:px-6 py-2.5 md:py-3.5">
        <Logo />

        <div className="flex items-center gap-3 md:gap-5">
          {/* Tombol 110 Desktop (Memicu Modal Konfirmasi) */}
          <button
            type="button"
            onClick={handleOpen110}
            className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl transition shadow-md active:scale-95 text-sm"
            title="Panggil Layanan Darurat 110"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            Panggil 110
          </button>

          <Image
            src="/icons/logo-polda-jateng.png"
            alt="Logo Polda Jawa Tengah"
            width={50}
            height={60}
            priority
            className="h-10 md:h-14 w-auto shrink-0 object-contain"
          />
        </div>
      </div>

      {/* Tab Navigasi (Shadow hilang di Desktop) */}
      <div className="w-full bg-slate-100 shadow-md md:shadow-none border-b border-slate-200 md:border-none">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-2 flex gap-2 md:gap-4">
          <Link
            href="/pospam"
            className={`flex-1 py-2.5 md:py-3 rounded-xl text-sm font-bold text-center transition ${
              isPospam
                ? "bg-amber-400 text-slate-900 shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            POSPAM TERDEKAT
          </Link>

          <Link
            href="/nomor-darurat"
            className={`flex-1 py-2.5 md:py-3 rounded-xl text-sm font-bold text-center transition ${
              isDarurat
                ? "bg-amber-400 text-slate-900 shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            NOMOR DARURAT
          </Link>
        </div>
      </div>
    </header>
  );
}
// src/components/shared/ui/Navbar.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import ForcePasswordChange from "./ForcePasswordChange";

function Logo({ title }) {
  return (
    <Link
      href="/"
      aria-label={title}
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

// Label peran di samping logo, mis. "Superadmin"
function RoleBadge({ children }) {
  return (
    <span className="hidden items-center gap-3 sm:flex">
      {/* <span className="h-8 w-px bg-white/20" aria-hidden="true" /> */}
      <span className="rounded-md border border-[#2BA3B8]/50 bg-[#2BA3B8]/15 px-2.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-[#7FD3E0]">
        {children}
      </span>
    </span>
  );
}

export default function Navbar({ title, items, badge }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Tutup menu mobile setiap pindah halaman
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Tutup menu mobile dengan tombol Esc
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-[1500] bg-[#3F5F6B] px-6 font-poppins text-white shadow-md">
      {/* Isi navbar dibatasi selebar kotak putih konten (max-w-7xl) */}
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 py-3 lg:gap-6 xl:gap-8">
        {/* Logo + label peran */}
        <div className="flex shrink-0 items-center gap-3 lg:mr-2 xl:mr-6">
          <Logo title={title} />
          {badge && <RoleBadge>{badge}</RoleBadge>}
        </div>

        {/* Menu desktop */}
        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 text-base font-medium transition-colors ${
                  active ? "text-white" : "text-sky-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Profil desktop (menempel di kanan) */}
        <div className="hidden min-w-0 lg:ml-auto lg:block">
          <ProfileMenu />
        </div>

        {/* Tombol hamburger (mobile) */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 lg:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Panel menu mobile (melayang di bawah navbar, tidak mendorong isi halaman) */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-white/10 bg-[#3F5F6B] shadow-lg lg:hidden">
          <div className="mx-auto w-full max-w-7xl px-6 pb-4 pt-2">
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-md px-3 py-2.5 text-base font-medium transition-colors ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-sky-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 border-t border-white/10 pt-3">
              <ProfileMenu mobile />
            </div>
          </div>
        </div>
      )}

      {/* Memaksa ganti password pada login pertama (must_change_password = true) */}
      <ForcePasswordChange />
    </nav>
  );
}
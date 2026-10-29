"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import ForcePasswordChange from "./ForcePasswordChange";
import { hasUnsavedChanges, runWithUnsavedGuard } from "./Modal";

function Logo({ title, onClick }) {
  return (
    <Link
      href="/"
      onClick={onClick}
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

// Label peran di samping logo, "Superadmin/Admin"
function RoleBadge({ children }) {
  return (
    <span className="hidden items-center gap-3 sm:flex">
      <span className="rounded-md border border-[#2BA3B8]/50 bg-[#2BA3B8]/15 px-2.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-[#7FD3E0]">
        {children}
      </span>
    </span>
  );
}

export default function Navbar({ title, items, badge }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function guardedClick(e, href) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; 
    if (!hasUnsavedChanges()) return; 
    e.preventDefault();
    runWithUnsavedGuard(() => router.push(href));
  }

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 py-3 lg:gap-6 xl:gap-8">
        <div className="flex shrink-0 items-center gap-3 lg:mr-2 xl:mr-6">
          <Logo title={title} onClick={(e) => guardedClick(e, "/")} />
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
                onClick={(e) => guardedClick(e, item.href)}
                className={`shrink-0 text-base font-medium transition-colors ${
                  active ? "text-white" : "text-sky-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Profil desktop */}
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

      {/* Panel menu mobile */}
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
                    onClick={(e) => {
                      guardedClick(e, item.href);
                      setMenuOpen(false);
                    }}
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

      <ForcePasswordChange />
    </nav>
  );
}
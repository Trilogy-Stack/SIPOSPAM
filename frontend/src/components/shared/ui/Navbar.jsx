// src/components/shared/ui/Navbar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileMenu from "./ProfileMenu";

function Logo({ title }) {
  return (
    <Link
      href="/"
      aria-label={title}
      className="mr-6 inline-flex flex-col items-stretch leading-none"
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

export default function Navbar({ title, items }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-[1500] bg-[#3F5F6B] text-white px-6 py-3 shadow-md font-poppins">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-8">
        <Logo title={title} />

        <div className="flex items-center gap-8">
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

        <ProfileMenu />
      </div>
    </nav>
  );
}
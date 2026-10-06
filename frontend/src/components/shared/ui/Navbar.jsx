// src/components/shared/ui/Navbar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Logo({ title }) {
  return (
    <Link
      href="/"
      aria-label={title}
      className="mr-6 inline-flex flex-col items-stretch leading-none"
    >
      <span className="flex justify-center text-4xl font-extrabold leading-[0.85] tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]">
        <span className="text-[#2BA3B8]">SI</span>
        <span className="text-white">POSPAM</span>
      </span>

      {/* w-0 + min-w-full: lebar wrapper mengikuti lebar teks logo, bukan teks tagline */}
      <span className="mt-0.5 block w-0 min-w-full [container-type:inline-size]">
        <span className="block whitespace-nowrap rounded-full bg-white px-[2cqw] py-[1.2cqw] text-center text-[length:3.6cqw] font-medium leading-none text-gray-800">
          Sistem Informasi Pos Pelayanan &amp; Pengamanan
        </span>
      </span>
    </Link>
  );
}

export default function Navbar({ title, items }) {
  const pathname = usePathname();

  return (
    <nav className="bg-[#3F5F6B] text-white px-10 py-3 flex items-center gap-8 shadow-md font-poppins">
      <Logo title={title} />
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-base transition-colors ${
              active
                ? "font-semibold text-white"
                : "font-medium text-sky-400 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
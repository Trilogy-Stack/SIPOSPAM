import HeaderTab from "./components/headerTab";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const KONTAK = {
  alamat: "Jl. Pahlawan No.1, Mugassari, Kec. Semarang Sel., Kota Semarang, Jawa Tengah 50142",   
  telepon: "(62) 000-0000-0000",  // format: "(024) 000 0000"
  email: "email.polda.jateng@gmail.com",    
};

// tampilan responsive
export default function PublikLayout({ children }) {

  const adaKontak = !!(KONTAK.alamat || KONTAK.telepon || KONTAK.email);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col w-full">
      {/* Header Full-Width Layar */}
      <HeaderTab />

      {/* Konten Utama Tetap Terpusat di Tengah */}
      <main className="w-full max-w-6xl mx-auto p-4 md:p-6 flex-1">
        {children}
      </main>

      ```jsx
      {/* Footer */}
      <footer className="w-full bg-[#3F5F6B] text-white">
        <div
          className={`max-w-6xl mx-auto px-4 md:px-6 py-4 grid gap-4 md:gap-6 text-center md:text-left ${
                       adaKontak ? "md:grid-cols-[1.5fr_0.8fr_1.4fr]" : "md:grid-cols-[2fr_1fr]"
          }`}
        >
          {/* Identitas instansi */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/logo-polda-jateng.png"
                alt="Logo Polda Jawa Tengah"
                width={50}
                height={60}
                className="h-9 w-auto shrink-0 object-contain"
              />
              <div className="text-left">
                <p className="text-base font-extrabold leading-none tracking-tight">
                  <span className="text-[#7FD3E2]">SI</span>POSPAM
                </p>
                <p className="mt-0.5 text-[11px] md:text-[10px] leading-snug text-white/70">
                  Sistem Informasi Pos Pelayanan &amp; Pengamanan
                </p>
              </div>
            </div>
            <p className="max-w-sm text-xs md:text-[11px] leading-relaxed text-white/70">
              Layanan informasi lokasi pos pelayanan dan pengamanan serta nomor darurat
              untuk masyarakat di wilayah Provinsi Jawa Tengah.
            </p>
          </div>

          {/* Menu */}
          <nav aria-label="Navigasi footer">
            <p className="text-xs md:text-[11px] font-bold uppercase tracking-wider text-white/90">Layanan</p>
            <ul className="mt-2 space-y-1 text-[13px] md:text-xs">
              <li>
                <Link href="/pospam" className="text-white/75 transition hover:text-white">
                  Pospam Terdekat
                </Link>
              </li>
              <li>
                <Link href="/nomor-darurat" className="text-white/75 transition hover:text-white">
                  Nomor Darurat
                </Link>
              </li>
            </ul>
          </nav>

          {/* Kontak */}
          {adaKontak && (
            <div>
              <p className="text-xs md:text-[11px] font-bold uppercase tracking-wider text-white/90">Kontak</p>
              <ul className="mt-2 space-y-1 text-[13px] md:text-xs text-white/75">
                {KONTAK.alamat && (
                  <li className="flex items-start justify-center md:justify-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <span className="text-left">{KONTAK.alamat}</span>
                  </li>
                )}
                {KONTAK.telepon && (
                  <li className="flex items-center justify-center md:justify-start gap-2">
                    <Phone size={14} className="shrink-0" />
                    <a href={`tel:${KONTAK.telepon.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                      {KONTAK.telepon}
                    </a>
                  </li>
                )}
                {KONTAK.email && (
                  <li className="flex items-center justify-center md:justify-start gap-2">
                    <Mail size={14} className="shrink-0" />
                    <a href={`mailto:${KONTAK.email}`} className="break-all hover:text-white">
                      {KONTAK.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Hak cipta */}
        <div className="border-t border-white/15">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-2.5 text-center text-[11px] md:text-[10px] text-white/60">
            &copy; {new Date().getFullYear()} Kepolisian Daerah Jawa Tengah. Seluruh hak dilindungi.
          </div>
        </div>
      </footer>

    </div>
  );
}
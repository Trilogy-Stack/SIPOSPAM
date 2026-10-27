// src/components/superadmin/PospamCardItem.jsx
import { MapPin } from "lucide-react";

// Logo WhatsApp (gelembung + gagang telepon), mengikuti warna teks
function WhatsAppIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function waNumber(nomor) {
  let d = String(nomor || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

function tampilTelepon(nomor) {
  const wa = waNumber(nomor);
  if (!wa || !wa.startsWith("62")) return nomor || "-";
  const r = wa.slice(2);
  return `+62 ${r.slice(0, 3)}-${r.slice(3, 7)}${r.length > 7 ? "-" + r.slice(7) : ""}`;
}

export default function PospamCardItem({ nomor, pospam }) {
  const wa = waNumber(pospam.telepon);
  const hasCoord = Number.isFinite(pospam.lat) && Number.isFinite(pospam.lng);
  const mapsUrl = hasCoord
    ? `https://www.google.com/maps/search/?api=1&query=${pospam.lat},${pospam.lng}`
    : null;

  // Tombol solid 44px dengan warna senada tema, ikon putih
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95";
  const btnOff = "cursor-not-allowed bg-gray-300 opacity-60";

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm sm:flex-row sm:items-stretch">
      {/* Nomor urut */}
      <div className="flex w-full shrink-0 items-center justify-center bg-[#1BA3BA] py-2 text-lg font-semibold text-white sm:w-12 sm:py-0">
        {nomor}
      </div>

      {/* Info pospam */}
      <div className="flex-1 px-5 py-3">
        <p className="text-base font-semibold text-gray-900">{pospam.nama}</p>
        <p className="text-xs text-gray-500">
          {[pospam.lokasi, pospam.area].filter(Boolean).join(", ")}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          {tampilTelepon(pospam.telepon)}
          {pospam.koordinator && pospam.koordinator !== "-" && (
            <span className="text-gray-500"> ({pospam.koordinator})</span>
          )}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pospam.fasilitas.map((f) => (
            <span
              key={f}
              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium leading-none text-gray-600"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Aksi: WhatsApp + Google Maps */}
      <div className="flex items-center justify-center gap-3 px-5 pb-3 sm:px-6 sm:py-3">
        {wa ? (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            title="Kirim WhatsApp"
            aria-label="Kirim WhatsApp"
            className={`${btn} bg-[#52A07B] hover:bg-[#438A68] focus-visible:ring-[#52A07B]`}
          >
            <WhatsAppIcon />
          </a>
        ) : (
          <span title="Nomor WhatsApp tidak tersedia" aria-label="WhatsApp tidak tersedia" className={`${btn} ${btnOff}`}>
            <WhatsAppIcon />
          </span>
        )}

        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            title="Buka di Google Maps"
            aria-label="Buka di Google Maps"
            className={`${btn} bg-[#4A9DB0] hover:bg-[#3D8799] focus-visible:ring-[#4A9DB0]`}
          >
            <MapPin size={22} strokeWidth={2} />
          </a>
        ) : (
          <span title="Lokasi tidak tersedia" aria-label="Lokasi tidak tersedia" className={`${btn} ${btnOff}`}>
            <MapPin size={22} strokeWidth={2} />
          </span>
        )}
      </div>
    </div>
  );
}
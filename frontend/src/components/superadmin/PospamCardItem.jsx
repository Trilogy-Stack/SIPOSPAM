// "0812-3456-789" / "+62 812..." -> "62812..." (format wa.me)
function waNumber(nomor) {
  let d = String(nomor || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

// "081234567890" -> "+62 812-3456-7890"
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

  const btn =
    "group flex h-11 w-11 items-center justify-center rounded-xl border bg-gradient-to-br to-white shadow-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1BA3BA] active:scale-95";
  const btnOff = "cursor-not-allowed border-gray-200 from-gray-100 opacity-50 grayscale";
  const icon = "h-6 w-6 object-contain";

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
            className={`${btn} border-emerald-200 from-emerald-50 hover:border-emerald-300`}
          >
            <img src="/icons/whatsapp-icon.png" alt="" className={icon} />
          </a>
        ) : (
          <span title="Nomor WhatsApp tidak tersedia" aria-label="WhatsApp tidak tersedia" className={`${btn} ${btnOff}`}>
            <img src="/icons/whatsapp-icon.png" alt="" className={icon} />
          </span>
        )}

        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            title="Buka di Google Maps"
            aria-label="Buka di Google Maps"
            className={`${btn} border-blue-200 from-blue-50 hover:border-blue-300`}
          >
            <img src="/icons/google-maps.png" alt="" className={icon} />
          </a>
        ) : (
          <span title="Lokasi tidak tersedia" aria-label="Lokasi tidak tersedia" className={`${btn} ${btnOff}`}>
            <img src="/icons/google-maps.png" alt="" className={icon} />
          </span>
        )}
      </div>
    </div>
  );
}
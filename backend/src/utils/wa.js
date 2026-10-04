// "0812-3456-789" / "+62 812..." / "812..." -> "62812..."
export function normalisasiNomor(nomor) {
  if (!nomor) return null;
  let d = String(nomor).replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

export function linkWhatsApp(nomor, pesan) {
  const n = normalisasiNomor(nomor);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(pesan)}`;
}

export function linkMaps(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function linkTelepon(nomor) {
  if (!nomor) return null;
  return `tel:${String(nomor).replace(/[^\d+]/g, "")}`;
}

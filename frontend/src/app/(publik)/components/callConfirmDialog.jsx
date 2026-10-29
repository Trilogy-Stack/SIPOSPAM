"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

const telHref = (phone) => `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;

export default function CallConfirmDialog({ target, onClose }) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(false);
  }, [target]);

  if (!target) return null;

  const tutup = () => {
    setIsChecked(false);
    onClose();
  };

  const handleLanjutkan = () => {
    const { agency_name, telephone } = target;
    tutup();

    window.location.href = telHref(telephone);
  };

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Konfirmasi menghubungi ${target.agency_name}`}
    >
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Ikon segitiga merah */}
        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md">
          <AlertTriangle className="w-10 h-10" />
        </div>

        {/* Nama instansi + nomor */}
        <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">
          Hubungi {target.agency_name}?
        </h3>
        <p className="text-sm font-semibold text-blue-700 mb-2">{target.telephone}</p>
        <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
          Layanan darurat diprioritaskan untuk situasi darurat dan mendesak. Segala bentuk
          penyalahgunaan akan ditindak tegas dan nomor Anda akan langsung menerima konsekuensi
          pemblokiran.
        </p>

        {/* Penanda mode testing (hilang otomatis saat MODE_TEST_WA = false)
        {MODE_TEST_WA && (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-4">
            Mode testing: akan dialihkan ke WhatsApp, bukan menelepon.
          </p>
        )} */}

        <div className="border-t pt-4">
          {/* Checkbox persetujuan */}
          <label className="flex items-start gap-2.5 text-left mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-[10px] text-gray-600 leading-tight">
              Saya telah membaca dan menyetujui Syarat & Ketentuan.
            </span>
          </label>

          {/* Tombol Batal & Lanjutkan */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={tutup}
              className="flex-1 py-2.5 rounded-xl border border-blue-600 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleLanjutkan}
              disabled={!isChecked}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition ${
                isChecked
                  ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
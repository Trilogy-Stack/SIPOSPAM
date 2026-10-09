"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function OneTapCall() {
  const [showModal, setShowModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // 🔴 UBAH NOMOR INI KE NOMOR WA KAMU UTK TESTING (Format: 628xxx)
//   const NOMOR_WA_TEST = "6282324609083"; //no alff
  // const NOMOR_WA_TEST = "6283127854969"; //no dwi
  const NOMOR_WA_TEST = "6281391121411"; //no zdn
  // const $NOMOR_HP_TEST = "081391121411";

  const handleConfirmCall = () => {
    setShowModal(false);
    setIsChecked(false); // Reset checkbox setelah klik

    // =========================================================================
    // 🧪 1. VERSI TESTING (Ke WhatsApp) - AKTIF SEKARANG
    // =========================================================================
    window.open(
      `https://wa.me/${NOMOR_WA_TEST}?text=Halo,%20ini%20uji%20coba%20fitur%20panggilan%20darurat%20110%20SIPOSPAM`,
      "_blank"
    );

    // =========================================================================
    // 🚀 2. VERSI PRODUCTION (Telepon 110 Asli) - DI-COMMENT
    // =========================================================================
    // Nanti kalau sudah mau rilis/demo asli, hapus comment kode di bawah ini 
    // dan comment/hapus kode WhatsApp di atas.
    //
    // window.location.href = "tel:110";
    // window.location.href = "tel:$NOMOR_HP_TEST";
  };

  return (
    <>
      {/* Floating Button Merah 110 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 flex justify-end pointer-events-none z-40">
        <button
            onClick={() => setShowModal(true)}
            className="pointer-events-auto bg-red-600 text-white w-14 h-14 rounded-full shadow-2xl flex flex-col items-center justify-center  hover:bg-red-700 transition active:scale-95"
            >
            <AlertTriangle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-extrabold leading-none">110</span>
        </button>
      </div>

      {/* Modal 2-Step Verification */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Icon Segitiga Merah */}
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md">
              <AlertTriangle className="w-10 h-10" />
            </div>

            {/* Teks Peringatan */}
            <h3 className="font-bold text-gray-900 text-sm mb-2 leading-tight">
              Layanan 110 diprioritaskan untuk situasi darurat dan mendesak
            </h3>
            <p className="text-[11px] text-gray-500 mb-5 leading-relaxed">
              Segala bentuk penyalahgunaan akan ditindak tegas dan nomor Anda
              akan langsung menerima konsekuensi pemblokiran.
            </p>

            <div className="border-t pt-4">
              {/* Checkbox Persetujuan */}
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
                  onClick={() => {
                    setShowModal(false);
                    setIsChecked(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-blue-600 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition"
                >
                  Batal
                </button>

                <button
                  onClick={handleConfirmCall}
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
      )}
    </>
  );
}
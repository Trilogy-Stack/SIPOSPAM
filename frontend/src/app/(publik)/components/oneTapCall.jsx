"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function OneTapCall() {
  const [showModal, setShowModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const NOMOR_WA_TEST = "6281391121411"; // no zdn

  // Mendengarkan trigger dari tombol 110 di Header Desktop
  useEffect(() => {
    const handleOpenModal = () => setShowModal(true);
    window.addEventListener("open-110-modal", handleOpenModal);
    return () => window.removeEventListener("open-110-modal", handleOpenModal);
  }, []);

  const handleConfirmCall = () => {
    setShowModal(false);
    setIsChecked(false);

    window.open(
      `https://wa.me/${NOMOR_WA_TEST}?text=Halo,%20ini%20uji%20coba%20fitur%20panggilan%20darurat%20110%20SIPOSPAM`,
      "_blank"
    );
  };

  return (
    <>
      {/* Floating Button Merah 110 (Hanya tampil di Mobile, Hilang di Laptop/Desktop) */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white w-14 h-14 rounded-full shadow-2xl flex flex-col items-center justify-center hover:bg-red-700 transition active:scale-95"
        >
          <AlertTriangle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-extrabold leading-none">110</span>
        </button>
      </div>

      {/* Modal 2-Step Verification (Bisa dipanggil dari Mobile maupun Desktop) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <h3 className="font-bold text-gray-900 text-sm mb-2 leading-tight">
              Layanan 110 diprioritaskan untuk situasi darurat dan mendesak
            </h3>
            <p className="text-[11px] text-gray-500 mb-5 leading-relaxed">
              Segala bentuk penyalahgunaan akan ditindak tegas dan nomor Anda
              akan langsung menerima konsekuensi pemblokiran.
            </p>

            <div className="border-t pt-4">
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
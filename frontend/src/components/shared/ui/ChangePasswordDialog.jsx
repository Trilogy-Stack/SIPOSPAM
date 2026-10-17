// src/components/shared/ui/ChangePasswordDialog.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { KeyRound, CheckCircle2, X } from "lucide-react";
import PasswordInput from "./PasswordInput";
import { gantiPassword } from "@/lib/api";

const MIN_LENGTH = 8;

/**
 * Dialog ganti password.
 *  - open     : tampilkan dialog
 *  - forced   : true = tidak bisa ditutup (dipakai saat login pertama, must_change_password)
 *  - onClose  : dipanggil saat dialog ditutup (hanya mode biasa)
 *  - onDone   : dipanggil beberapa saat setelah password berhasil diganti,
 *               dengan argumen { password_baru }
 *  - onLogout : tombol "Keluar" pada mode paksa
 */
export default function ChangePasswordDialog({ open, forced = false, onClose, onDone, onLogout }) {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  // Kosongkan isian setiap dialog dibuka
  useEffect(() => {
    if (open) {
      setLama("");
      setBaru("");
      setKonfirmasi("");
      setError("");
      setSaving(false);
      setDone(false);
    }
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Esc menutup dialog (kecuali mode paksa atau sedang menyimpan)
  useEffect(() => {
    if (!open || forced) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving && !done) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, forced, saving, done, onClose]);

  if (!open || typeof document === "undefined") return null;

  const canClose = !forced && !saving && !done;

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving || done) return;

    if (baru.length < MIN_LENGTH) {
      setError(`Password baru minimal ${MIN_LENGTH} karakter.`);
      return;
    }
    if (baru !== konfirmasi) {
      setError("Konfirmasi password tidak sama dengan password baru.");
      return;
    }
    if (baru === lama) {
      setError("Password baru harus berbeda dari password lama.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await gantiPassword({ password_lama: lama, password_baru: baru });
      setDone(true);
      timer.current = setTimeout(() => onDone?.({ password_baru: baru }), 1800);
    } catch (err) {
      setError(err.message || "Gagal mengganti password. Coba lagi.");
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ganti password"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && canClose) onClose?.();
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl text-gray-800">
        {done ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">Password berhasil diganti</h2>
            <p className="text-sm text-gray-500">
              {forced
                ? "Anda akan diarahkan ke dashboard."
                : "Anda akan keluar otomatis. Silakan masuk kembali dengan password baru."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a9fb8]/10 text-[#1a9fb8]">
                  <KeyRound size={18} />
                </span>
                <h2 className="text-base font-bold text-gray-900">
                  {forced ? "Buat Password Baru" : "Ganti Password"}
                </h2>
              </div>
              {canClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup"
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {forced && (
              <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-center text-amber-800">
                PERHATIAN ! <br/>
                Sebagai langkah keamanan awal, silakan perbarui password Anda sebelum mengakses halaman dashboard.
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                {forced ? "Password sementara" : "Password lama"}
              </label>
              <PasswordInput
                value={lama}
                onChange={(e) => setLama(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Password baru
              </label>
              <PasswordInput
                value={baru}
                onChange={(e) => setBaru(e.target.value)}
                autoComplete="new-password"
              />
              <p className="mt-1 text-[11px] text-gray-500">Minimal {MIN_LENGTH} karakter.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Konfirmasi password baru
              </label>
              <PasswordInput
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
              >
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              {canClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
              ) : forced ? (
                <button
                  type="button"
                  onClick={() => onLogout?.()}
                  disabled={saving}
                  className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
                >
                  Keluar
                </button>
              ) : null}
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-md bg-[#1a9fb8] py-2.5 text-sm font-bold text-white hover:bg-[#158aa0] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
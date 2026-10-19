// src/components/shared/ui/SendResetLinkDialog.jsx
"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, MailCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase";

const COOLDOWN_DETIK = 60; // jeda sebelum boleh kirim ulang (menghindari batas kirim email Supabase)

// "budi.santoso@gmail.com" -> "bu***@gmail.com"
function maskEmail(email = "") {
  const [name = "", domain = ""] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

/**
 * Dialog konfirmasi: kirim link ganti password ke email akun yang sedang login.
 * Link membuka halaman /reset-password.
 */
export default function SendResetLinkDialog({ open, email, onClose }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Kosongkan status setiap dialog dibuka
  useEffect(() => {
    if (open) {
      setSending(false);
      setSent(false);
      setError("");
      setCooldown(0);
    }
  }, [open]);

  // Hitung mundur untuk tombol "Kirim ulang"
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Esc menutup dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !sending) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, sending, onClose]);

  if (!open || typeof document === "undefined") return null;

  async function handleSend() {
    if (sending || cooldown > 0 || !email) return;
    setError("");
    setSending(true);
    try {
      const { error: err } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) {
        if (err.status === 429 || err.code === "over_email_send_rate_limit") {
          setError("Terlalu sering meminta link. Tunggu beberapa menit lalu coba lagi.");
        } else {
          setError(err.message || "Gagal mengirim email. Coba lagi.");
        }
        return;
      }
      setSent(true);
      setCooldown(COOLDOWN_DETIK);
    } catch (e) {
      setError(e?.message || "Gagal mengirim email. Coba lagi.");
    } finally {
      setSending(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ganti password lewat email"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !sending) onClose?.();
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl text-gray-800 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a9fb8]/10 text-[#1a9fb8]">
              {sent ? <MailCheck size={18} /> : <Mail size={18} />}
            </span>
            <h2 className="text-base font-bold text-gray-900">Ganti Password</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Tutup"
            className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Link ganti password sudah dikirim ke{" "}
              <span className="font-semibold text-gray-900">{maskEmail(email)}</span>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
              <li>Buka email tersebut lalu klik link di dalamnya.</li>
              <li>Buka link di browser yang sama dengan yang Anda pakai sekarang.</li>
              <li>Tidak menemukan emailnya? Periksa folder spam.</li>
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Kami akan mengirim link untuk membuat password baru ke email akun Anda:{" "}
            <span className="font-semibold text-gray-900">{maskEmail(email)}</span>
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
          >
            {sent ? "Tutup" : "Batal"}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || cooldown > 0 || !email}
            className="flex-1 rounded-md bg-[#1a9fb8] py-2.5 text-sm font-bold text-white hover:bg-[#158aa0] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending
              ? "Mengirim..."
              : cooldown > 0
              ? `Kirim ulang (${cooldown}s)`
              : sent
              ? "Kirim ulang"
              : "Kirim Link"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

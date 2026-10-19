// src/app/lupa-password/page.jsx
// Halaman "Lupa Password" (publik, dibuka dari halaman login).
// Mengirim link ganti password ke email akun; link membuka /reset-password.
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";

const COOLDOWN_DETIK = 60; // jeda sebelum boleh kirim ulang (menghindari batas kirim email Supabase)

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Hitung mundur untuk tombol "Kirim ulang"
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending || cooldown > 0) return;

    const alamat = email.trim().toLowerCase();
    if (!alamat) return;

    setError("");
    setSending(true);
    try {
      const { error: err } = await createClient().auth.resetPasswordForEmail(alamat, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (err) {
        if (err.status === 429 || err.code === "over_email_send_rate_limit") {
          setError("Terlalu sering meminta link. Tunggu beberapa menit lalu coba lagi.");
        } else if (err.code === "email_address_not_authorized") {
          setError("Email belum bisa dikirim ke alamat ini. Silakan hubungi administrator.");
        } else {
          setError(err.message || "Gagal mengirim email. Coba lagi.");
        }
        return;
      }

      // Supabase menjawab sukses juga untuk email yang tidak terdaftar (tidak membocorkan
      // akun mana yang ada), jadi pesan di bawah sengaja dibuat netral.
      setSent(true);
      setCooldown(COOLDOWN_DETIK);
    } catch (e2) {
      setError(e2?.message || "Gagal mengirim email. Coba lagi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#e9eef5] flex items-center justify-center p-4">
      <div className="w-full max-w-[40rem] bg-white rounded-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="text-5xl font-extrabold tracking-tight mb-1">
            <span className="text-[#00a3c4]">SI</span>
            <span className="text-gray-900">POSPAM</span>
          </div>
          <div className="bg-black text-white text-[11px] font-medium px-3 py-1 rounded-full">
            Sistem Informasi Pos Pelayanan & Pengamanan
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Lupa Password?</h1>
          <p className="text-xs text-gray-500 max-w-sm">
            Masukkan email akun Anda. Kami akan mengirim link untuk membuat password baru.
          </p>
        </div>

        {sent && (
          <div className="w-full mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center space-y-2">
            <MailCheck className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">Periksa email Anda</p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Jika email <span className="font-semibold">{email.trim().toLowerCase()}</span>{" "}
              terdaftar, link ganti password sudah dikirim. Buka link di browser yang sama
              dengan yang Anda pakai sekarang. Tidak menemukan emailnya? Periksa folder spam.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="alamatemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-transparent rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#00a3c4] transition"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg text-center"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || cooldown > 0}
            className="w-full bg-[#00a3c4] hover:bg-[#008ca8] text-white font-medium py-3 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending
              ? "Mengirim..."
              : cooldown > 0
              ? `Kirim ulang (${cooldown}s)`
              : sent
              ? "Kirim ulang"
              : "Kirim Link"}
          </button>

          <Link
            href="/login"
            className="text-center text-xs font-medium text-[#00a3c4] hover:underline"
          >
            Kembali ke halaman login
          </Link>
        </form>
      </div>
    </div>
  );
}

// src/app/reset-password/page.jsx
// Halaman tujuan link "ganti password" dari email. Bersifat publik (tidak masuk matcher proxy.js),
// tetapi formnya hanya tampil kalau halaman dibuka dari link email yang valid.
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getMe } from "@/lib/api";
import { homeFor } from "@/lib/rbac";
import PasswordInput from "@/components/shared/ui/PasswordInput";

const MIN_LENGTH = 8;

function Shell({ children }) {
  return (
    <div className="w-full min-h-screen bg-[#e9eef5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-5">
        <div className="text-center">
          <div className="text-4xl font-extrabold tracking-tight">
            <span className="text-[#00a3c4]">SI</span>
            <span className="text-gray-900">POSPAM</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // checking | ready | invalid | done
  const [baru, setBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fromLink = useRef(null);

  useEffect(() => {
    // Catat SEKALI apakah halaman ini dibuka dari link email. Supabase menghapus kode dari URL
    // setelah dipakai, jadi harus dibaca sebelum klien dibuat.
    if (fromLink.current === null) {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const linkError = query.get("error_description") || hash.get("error_description");
      fromLink.current =
        !linkError && (query.has("code") || query.has("token_hash") || hash.has("access_token"));
    }

    // Tanpa link yang valid, jangan tampilkan form (mencegah pengguna yang sedang login
    // mengganti password tanpa konfirmasi lewat email).
    if (!fromLink.current) {
      setStatus("invalid");
      return;
    }

    let cancelled = false;
    // getSession() menunggu pertukaran kode dari link email selesai
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) setStatus(session ? "ready" : "invalid");
      })
      .catch(() => !cancelled && setStatus("invalid"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    if (baru.length < MIN_LENGTH) {
      setError(`Password baru minimal ${MIN_LENGTH} karakter.`);
      return;
    }
    if (baru !== konfirmasi) {
      setError("Konfirmasi password tidak sama dengan password baru.");
      return;
    }

    setError("");
    setSaving(true);
    const { error: err } = await createClient().auth.updateUser({ password: baru });

    if (err) {
      setError(
        err.code === "same_password"
          ? "Password baru tidak boleh sama dengan password lama."
          : err.message || "Gagal mengganti password. Coba lagi."
      );
      setSaving(false);
      return;
    }

    setStatus("done");
    // Langsung ke dashboard sesuai peran, tanpa login ulang
    setTimeout(async () => {
      try {
        const me = await getMe();
        router.replace(homeFor(me.role) || "/login");
        router.refresh();
      } catch {
        router.replace("/login");
      }
    }, 1600);
  }

  if (status === "checking") {
    return (
      <Shell>
        <p className="text-center text-sm text-gray-500">Memeriksa link...</p>
      </Shell>
    );
  }

  if (status === "invalid") {
    return (
      <Shell>
        <div className="text-center space-y-3">
          <TriangleAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="text-base font-bold text-gray-900">Link tidak valid</h1>
          <p className="text-sm text-gray-500">
            Link ganti password sudah kedaluwarsa, sudah dipakai, atau halaman ini tidak dibuka
            dari link di email. Minta link baru lewat menu profil, bagian Ganti Password.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-[#00a3c4] hover:underline"
          >
            Kembali ke halaman login
          </Link>
        </div>
      </Shell>
    );
  }

  if (status === "done") {
    return (
      <Shell>
        <div className="text-center space-y-3 py-2">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="text-base font-bold text-gray-900">Password berhasil diganti</h1>
          <p className="text-sm text-gray-500">Anda akan diarahkan ke dashboard.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">Buat Password Baru</h1>
        <p className="mt-1 text-xs text-gray-500">Masukkan password baru untuk akun Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Password baru</label>
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

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-[#00a3c4] py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#008ca8] disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Password"}
        </button>
      </form>
    </Shell>
  );
}

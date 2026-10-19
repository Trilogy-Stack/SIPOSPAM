"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getMe } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      const me = await getMe(); // { id, email, role, wilayah }
      router.push(me.role === "super_admin" ? "/superadmin/dashboard" : "/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login gagal. Periksa email dan password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#e9eef5] flex items-center justify-center p-4">
      <div className="w-full max-w-[40rem] md:min-h-[620px] bg-white rounded-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center">
        
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

        {/* Judul & Subjudul (Universal untuk Admin & Superadmin) */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Selamat Datang!
          </h1>
          <p className="text-xs text-gray-500">
            Silakan masukkan akun Anda untuk mengakses dashboard.
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Email / Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama pengguna/Email
            </label>
            <input
              type="email"
              required
              placeholder="alamatemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-transparent rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#00a3c4] transition"
            />
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kata sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="***********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f3f4f6] border border-transparent rounded-lg px-4 py-3 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#00a3c4] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-end text-xs mt-1">
        
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Silakan hubungi administrator untuk reset password.");
              }}
              className="text-[#00a3c4] font-medium hover:underline"
            >
              Lupa Password?
            </a>
          </div>

          {/* Alert Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#00a3c4] hover:bg-[#008ca8] text-white font-medium py-3 rounded-lg shadow-sm transition disabled:opacity-50 mt-2"
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
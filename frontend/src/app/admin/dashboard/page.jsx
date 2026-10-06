"use client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { profile, logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Dashboard Admin</h1>
      <p className="mt-2 text-sm text-gray-600">
        Login sebagai: {profile?.email} (role: {profile?.role})
      </p>
      <button onClick={logout} className="mt-4 text-sm text-red-600 underline">
        Logout
      </button>
    </div>
  );
}
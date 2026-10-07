"use client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { profile, logout } = useAuth();

  return (
    <div className="p-6 bg-[#E9ECF6] min-h-screen font-poppins">
      <h1 className="text-xl font-bold">Dashboard Admin</h1>
      <p className="mt-2 text-sm text-gray-600">
        Login sebagai: {profile?.email} (role: {profile?.role})
      </p>
    </div>
  );
}
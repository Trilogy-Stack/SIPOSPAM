// src/app/admin/layout.jsx
import Navbar from "@/components/shared/ui/Navbar";

// Menu navbar admin. Teman yang lanjut membangun halaman admin tinggal
// menambah item di sini, misalnya { href: "/admin/pospam", label: "Pospam" }.
const adminMenu = [
  { href: "/admin/dashboard", label: "Dashboard" },
];

export default function AdminLayout({ children }) {
  return (
    <>
      <Navbar title="SIPOSPAM Admin" items={adminMenu} />
      {children}
    </>
  );
}
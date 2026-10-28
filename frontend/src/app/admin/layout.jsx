import Navbar from "@/components/shared/ui/Navbar";

const adminMenu = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/kelola-pospam", label: "Kelola Pospam" },
  { href: "/admin/kelola-nomor-darurat", label: "Nomor Darurat" },
];

export default function AdminLayout({ children }) {
  return (
    <>
      <Navbar title="SIPOSPAM Admin" items={adminMenu} />
      {children}
    </>
  );
}
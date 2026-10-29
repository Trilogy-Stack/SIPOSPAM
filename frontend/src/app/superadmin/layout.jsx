import Navbar from "@/components/shared/ui/Navbar";

const menuSuperadmin = [
  { label: "Dashboard", href: "/superadmin/dashboard" },
  { label: "Kelola Admin", href: "/superadmin/kelola-admin" },
  { label: "Nomor Nasional", href: "/superadmin/nomor-nasional" },
];

export default function SuperadminLayout({ children }) {
  return (
    <div>
      <Navbar
        title="SIPOSPAM — Superadmin"
        items={menuSuperadmin}
        badge="Superadmin"
      />
      <main>{children}</main>
    </div>
  );
}
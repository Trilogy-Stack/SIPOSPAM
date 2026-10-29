import HeaderTab from "./components/headerTab";

// ini tampilan responsive
export default function PublikLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col w-full">
      {/* Header Full-Width Layar */}
      <HeaderTab />

      {/* Konten Utama Tetap Terpusat di Tengah */}
      <main className="w-full max-w-6xl mx-auto p-4 md:p-6 flex-1">
        {children}
      </main>
    </div>
  );
}
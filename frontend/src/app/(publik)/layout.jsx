import HeaderTab from "./components/headerTab";

// ini tampilan mobile
// export default function PublikLayout({ children }) {
//   return (
//     // Background luar gelap biar kontras dengan frame HP
//     <div className="min-h-screen bg-slate-900 flex justify-center items-start sm:py-4">
//       {/* Container Frame HP (max-w-md / 448px) */}
//       <div className="w-full max-w-md min-h-screen bg-white shadow-2xl relative flex flex-col overflow-x-clip">
//         <HeaderTab />
//         <div className="flex-1">{children}</div>
//       </div>
//     </div>
//   );
// }

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
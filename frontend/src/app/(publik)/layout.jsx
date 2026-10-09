import HeaderTab from "./components/headerTab";

export default function PublikLayout({ children }) {
  return (
    // Background luar gelap biar kontras dengan frame HP
    <div className="min-h-screen bg-slate-900 flex justify-center items-start sm:py-4">
      {/* Container Frame HP (max-w-md / 448px) */}
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl relative flex flex-col overflow-x-hidden">\
        <HeaderTab />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
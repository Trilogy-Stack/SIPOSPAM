// src/components/superadmin/PospamCardItem.jsx
export default function PospamCardItem({ nomor, pospam }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="flex w-12 shrink-0 items-center justify-center bg-[#1BA3BA] text-lg font-semibold text-white">
        {nomor}
      </div>
      <div className="flex-1 px-5 py-3">
        <p className="text-base font-semibold text-gray-900">{pospam.nama}</p>
        <p className="text-xs text-gray-500">{pospam.lokasi}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {pospam.fasilitas.map((f) => (
            <span
              key={f}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-start whitespace-nowrap px-5 py-3 text-sm text-gray-700">
        ({pospam.telepon})
      </div>
    </div>
  );
}
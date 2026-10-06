export default function PospamCardItem({ nomor, pospam }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
      <div className="flex w-14 shrink-0 items-center justify-center bg-[#1BA3BA] text-2xl font-bold text-white">
        {nomor}
      </div>
      <div className="flex-1 px-6 py-4">
        <p className="text-xl font-medium text-gray-900">{pospam.nama}</p>
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
      <div className="flex items-start whitespace-nowrap px-6 py-4 text-sm text-gray-800">
        ({pospam.telepon})
      </div>
    </div>
  );
}
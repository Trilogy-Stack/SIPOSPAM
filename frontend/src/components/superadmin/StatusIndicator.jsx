// src/components/superadmin/StatusIndicator.jsx
export default function StatusIndicator({ current, total, label = "Jumlah" }) {
  return (
    <span className="whitespace-nowrap rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-500">
      {label}: <span className="ml-1 font-semibold text-gray-900">{current}/{total}</span>
    </span>
  );
}
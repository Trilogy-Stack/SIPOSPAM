export default function StatusIndicator({ current, total, label = "Jumlah" }) {
  return (
    <span className="whitespace-nowrap rounded border border-gray-900 px-3.5 py-1.5 text-base font-medium text-gray-900">
      {label}: <span className="ml-1">{current}/{total}</span>
    </span>
  );
}
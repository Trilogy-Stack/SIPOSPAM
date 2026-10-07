// src/components/superadmin/EmptyState.jsx
export default function EmptyState({ message = "Data belum ditambahkan" }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-[#F8F8FA] py-12 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}
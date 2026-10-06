// src/components/superadmin/EmptyState.jsx
export default function EmptyState({ message = "Data belum ditambahkan" }) {
  return (
    <div className="text-center text-gray-400 text-sm py-10 border rounded border-dashed">
      {message}
    </div>
  );
}
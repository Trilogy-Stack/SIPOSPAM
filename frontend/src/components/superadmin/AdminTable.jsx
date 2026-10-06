// src/components/superadmin/AdminTable.jsx
export default function AdminTable({ admins }) {
  return (
    <table className="w-full border text-sm">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2">Nama Wilayah</th>
          <th className="p-2">Email</th>
          <th className="p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((a) => (
          <tr key={a.id} className="border-t">
            <td className="p-2">{a.wilayah?.nama}</td>
            <td className="p-2">{a.email}</td>
            <td className="p-2">
              <span className={a.aktif ? "text-green-600" : "text-gray-400"}>
                {a.aktif ? "Aktif" : "Nonaktif"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
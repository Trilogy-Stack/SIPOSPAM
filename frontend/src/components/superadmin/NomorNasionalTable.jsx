// src/components/superadmin/NomorNasionalTable.jsx
import { Pencil, Trash2 } from "lucide-react";

export default function NomorNasionalTable({ data, onEdit, onDelete }) {
  return (
    <table className="w-full border text-sm">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2">Nama</th>
          <th className="p-2">Nomor</th>
          <th className="p-2 w-24">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {data.map((n) => (
          <tr key={n.id} className="border-t">
            <td className="p-2">{n.nama}</td>
            <td className="p-2">{n.nomor}</td>
            <td className="p-2 flex gap-2">
              <button onClick={() => onEdit(n)} className="text-blue-600"><Pencil size={16} /></button>
              <button onClick={() => onDelete(n.id)} className="text-red-600"><Trash2 size={16} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
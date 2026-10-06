import PospamCardItem from "./PospamCardItem";

export default function PospamCardList({ wilayah }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Hasil daftar pos pam {wilayah.nama}
      </h2>
      {wilayah.pospam.map((p, i) => (
        <PospamCardItem key={p.id} nomor={i + 1} pospam={p} />
      ))}
    </div>
  );
}
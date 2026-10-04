// Kode error PostgreSQL yang umum -> status + pesan ramah
const KODE_DB = {
  "23505": [409, "Data sudah ada (duplikat)"],
  "23503": [409, "Data masih berelasi dengan data lain, atau referensinya tidak ditemukan"],
  "23514": [400, "Data tidak memenuhi aturan database"],
  "23502": [400, "Ada kolom wajib yang kosong"],
  "22P02": [400, "Format data tidak valid"],
};

export default function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err?.name === "MulterError") {
    const pesan =
      err.code === "LIMIT_FILE_SIZE"
        ? "Ukuran foto maksimal 3 MB"
        : "Upload tidak valid (kirim satu file di field 'foto')";
    return res.status(400).json({ message: pesan });
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Body JSON tidak valid" });
  }

  if (typeof err?.status === "number" && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  const db = KODE_DB[err?.code];
  if (db) return res.status(db[0]).json({ message: db[1] });

  console.error(err);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
}

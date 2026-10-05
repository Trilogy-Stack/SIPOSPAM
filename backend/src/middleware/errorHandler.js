// UDA TAK SESUAIKAN

// Pemetaan kode error PostgreSQL ke status HTTP dan pesan yang ramah
const KODE_DB = {
  "23505": [409, "Data sudah ada (duplikat)"],
  "23503": [409, "Data masih berelasi dengan data lain, atau referensinya tidak ditemukan"],
  "23514": [400, "Data tidak memenuhi aturan database"],
  "23502": [400, "Ada kolom wajib yang belum diisi"],
  "22P02": [400, "Format data atau ID tidak valid"],
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Penanganan error dari Multer (Upload berkas)
  if (err?.name === "MulterError") {
    let pesan = "Gagal mengunggah berkas";
    if (err.code === "LIMIT_FILE_SIZE") {
      pesan = "Ukuran berkas terlalu besar (maksimal 3 MB)";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      pesan = "Field unggahan tidak sesuai atau melebihi batas jumlah berkas";
    }
    return res.status(400).json({ message: pesan });
  }

  // Penanganan error format JSON tidak valid
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Format body JSON tidak valid" });
  }

  // Penanganan HttpError buatan aplikasi (status < 500)
  const statusHttp = err?.status || err?.statusCode;
  if (typeof statusHttp === "number" && statusHttp < 500) {
    return res.status(statusHttp).json({ message: err.message });
  }

  // Penanganan error khusus dari database PostgreSQL / Supabase
  const dbError = KODE_DB[err?.code];
  if (dbError) {
    return res.status(dbError[0]).json({ message: dbError[1] });
  }

  // Error server internal (500)
  console.error("Internal Server Error:", err);
  return res.status(500).json({ message: "Terjadi kesalahan pada server" });
};
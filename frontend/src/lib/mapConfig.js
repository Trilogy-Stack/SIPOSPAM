// Tampilan awal dan batas zoom-out, seluruh daratan Jawa Tengah plus sedikit ruang
// (selatan sampai Paranggupito, barat sampai Brebes, timur sampai Blora/Rembang)
export const JATENG_BOUNDS = [
  [-8.25, 108.52], // kiri bawah
  [-6.37, 111.73], // kanan atas
];

// Batas geser peta, lebih longgar dari JATENG_BOUNDS supaya tepi wilayah bisa dilihat penuh saat zoom dekat
export const JATENG_PAN_BOUNDS = [
  [-8.40, 108.40],
  [-6.22, 111.85],
];
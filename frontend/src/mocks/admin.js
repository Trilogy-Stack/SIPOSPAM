// src/mocks/admin.js
// Bentuk ini sama di respons listAdmin() di adminController.js
export const mockAdminList = [
  { id: "1", email: "admin.salatiga@polri.go.id", aktif: true, created_at: "2026-01-01", wilayah: { id: "w1", nama: "Polres Salatiga" } },
  { id: "2", email: "polresta.semarang@gmail.com", aktif: true, created_at: "2026-01-02", wilayah: { id: "w2", nama: "Polresta Semarang" } },
];
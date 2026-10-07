// src/mocks/wilayah.js
const PALETTE = ["#1C7293", "#2E8B57", "#C9A227", "#B5574D", "#6A4C93", "#3A7CA5"];

export const mockWilayahList = [
  {
    id: "w1",
    nama: "POLRESTABES SEMARANG",
    color: PALETTE[0],
    bounds: [[-7.08, 110.35], [-6.92, 110.50]], // [[south,west],[north,east]]
    pospam: [
      { id: "p1", nama: "POSPAM SATU", lokasi: "Jalur Tol Semarang-Solo KM 15", fasilitas: ["Toilet", "Mushola"], telepon: "0812-1111-0001", lat: -6.99, lng: 110.42 },
      { id: "p2", nama: "POSPAM DUA", lokasi: "Jalur Pantura Kaligawe", fasilitas: ["Toilet", "Rest Area"], telepon: "0812-1111-0002", lat: -6.96, lng: 110.45 },
    ],
  },
  {
    id: "w2",
    nama: "POLRES DEMAK",
    color: PALETTE[1],
    bounds: [[-6.95, 110.55], [-6.75, 110.75]],
    pospam: [
      { id: "p3", nama: "POSPAM SATU", lokasi: "Jalur Pantura Demak Kota", fasilitas: ["Toilet", "Mushola", "Rest Area"], telepon: "0812-2222-0001", lat: -6.89, lng: 110.64 },
    ],
  },
  {
    id: "w3",
    nama: "POLRESTA BANYUMAS",
    color: PALETTE[2],
    bounds: [[-7.55, 109.20], [-7.35, 109.40]],
    pospam: [
      { id: "p4", nama: "POSPAM SATU", lokasi: "Jalur Selatan Purwokerto", fasilitas: ["Toilet"], telepon: "0812-3333-0001", lat: -7.42, lng: 109.24 },
      { id: "p5", nama: "POSPAM DUA", lokasi: "Rest Area KM 229", fasilitas: ["Mushola", "Rest Area"], telepon: "0812-3333-0002", lat: -7.45, lng: 109.30 },
    ],
  },
];

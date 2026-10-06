import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Rute
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// import pospamRoutes from './routes/pospamRoutes.js'; // Un-comment jika pospamRoutes sudah dibuat
// import nomorRoutes from './routes/nomorRoutes.js';   // Un-comment jika nomorRoutes sudah dibuat

// Import Error Handler
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.send('API SIPOSPAM Running...');
});

// Registrasi Rute API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/pospam', pospamRoutes);
// app.use('/api/nomor-darurat', nomorRoutes);

// Global Error Handler (WAJIB di paling bawah setelah semua rute)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
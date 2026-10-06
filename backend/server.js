import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Rute Utama dari folder src/
import routes from './src/routes/index.js';

// Import Error Handler dari folder src/
import { errorHandler } from './src/middleware/errorHandler.js';

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

// Registrasi Rute API (Otomatis memuat /auth, /admin, /pospam, /nomor-darurat, /wilayah)
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
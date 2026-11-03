import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './src/routes/index.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Asal frontend yang diizinkan, diisi lewat env FRONTEND_URL (pisahkan dengan koma bila lebih dari satu).
// Contoh: FRONTEND_URL=https://siacore.vercel.app
// Saat pengembangan lokal, localhost:3000 otomatis diizinkan.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000');
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      // Tanpa header Origin (curl, k6, cek server-ke-server) tetap boleh.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Asal tidak diizinkan oleh CORS'));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('API SIPOSPAM Running...');
});

app.use('/api', routes);

app.use(errorHandler);

// Di Vercel (serverless) tidak boleh ada listen(); aplikasi cukup diekspor.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;
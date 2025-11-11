// index.js (Ana Giriş Noktası)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. .env dosyasındaki config'leri yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 2. Temel Middleware'ler
app.use(cors()); // Farklı portlardan (frontend) gelen isteklere izin ver
app.use(express.json()); // Gelen JSON body'lerini işle
app.use(express.urlencoded({ extended: true }));

// 3. Ana API Yönlendiricisi
// Tüm rotalarımız /api prefix'i ile başlayacak
const mainRouter = require('./src/routes');
app.use('/api', mainRouter);

// 4. (Opsiyonel) Temel Hata Yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Sunucuda beklenmedik bir hata oluştu!' });
});

// 5. Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`🚀 Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});
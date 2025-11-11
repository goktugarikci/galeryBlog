// index.js (Morgan Eklenmiş Tam Hali)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const morgan = require('morgan'); // 1. Morgan'ı import et

// 1. .env dosyasındaki config'leri yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 2. Temel Middleware'ler
app.use(cors()); // CORS
app.use(express.json()); // Gelen JSON body'lerini işle
app.use(express.urlencoded({ extended: true }));

// Statik dosya (uploads) sunumu
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. (YENİ) HTTP İsteklerini Konsola Yazdırma (Morgan)
// 'dev' formatı, geliştirme için ideal, renkli ve kısa loglar sağlar:
// Örn: GET /api/products 200 5.123 ms - 1234
app.use(morgan('dev')); 

// 4. Ana API Yönlendiricisi
// (Morgan'dan SONRA gelmeli)
const mainRouter = require('./src/routes');
app.use('/api', mainRouter);

// 5. (Opsiyonel) Temel Hata Yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Sunucuda beklenmedik bir hata oluştu!' });
});

// 6. WebSocket (Canlı Destek) Sunucu Kurulumu
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Frontend adresiniz
        methods: ["GET", "POST"]
    }
});

// io sunucusunu controller'ların erişebilmesi için app'e ekle
app.set('io', io); 

// Socket.io bağlantı mantığını çağır
const initializeSocket = require('./src/socket/chat.handler');
initializeSocket(io);

// 7. Sunucuyu Başlat
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend (HTTP ve WebSocket) sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});
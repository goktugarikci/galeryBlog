// index.js (Güncellenmiş Hali)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const mainRouter = require('./src/routes');
app.use('/api', mainRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Sunucuda beklenmedik bir hata oluştu!' });
});

// === SOCKET.IO GÜNCELLEMESİ ===

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// YENİ: io sunucusunu app'e ekle (controller'ların erişebilmesi için)
app.set('io', io); 

// Socket.io bağlantı mantığını çağır
const initializeSocket = require('./src/socket/chat.handler');
initializeSocket(io); // Bu dosya bir sonraki adımda güncellenecek

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend (HTTP ve WebSocket) sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});
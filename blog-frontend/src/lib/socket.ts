import { io } from 'socket.io-client';

// 1. .env.local dosyasından WebSocket sunucu adresini al
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// 2. Socket bağlantısını oluştur
// 'autoConnect: false' -> Sadece istediğimiz zaman (örn: giriş yapınca) bağlanmasını sağlar
const socket = io(SOCKET_URL, {
  autoConnect: false
});

export default socket;
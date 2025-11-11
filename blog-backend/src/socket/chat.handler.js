// src/socket/chat.handler.js (Güncellenmiş Hali)
const prisma = require('../config/prisma'); 

const initializeSocket = (io) => {
    
    io.on('connection', (socket) => {
        console.log(`Bir kullanıcı bağlandı: ${socket.id}`);

        // === YENİ: ADMİN BAĞLANTISI ===
        // Admin panelini açan bir admin bu olayı tetikler
        socket.on('admin_connected', () => {
            socket.join('admin_room');
            console.log(`Admin ${socket.id} 'admin_room' odasına katıldı.`);
        });

        // === 1. KULLANICI ODAYA KATILDIĞINDA ===
        socket.on('join_chat', async (data) => {
            const userId = data.userId;
            if (!userId) return;
            let room = await prisma.chatRoom.findFirst({
                where: { userId: userId, status: 'open' }
            });
            if (!room) {
                room = await prisma.chatRoom.create({
                    data: { userId: userId }
                });
            }
            socket.join(room.id);
            socket.emit('joined_room', { roomId: room.id });
        });

        // === 2. ADMİN BİR ODAYA KATILDIĞINDA ===
        socket.on('admin_join_room', (data) => {
            const roomId = data.roomId;
            if (!roomId) return;
            socket.join(roomId);
            socket.emit('joined_room', { roomId: roomId });
        });

        // === 3. MESAJ GÖNDERİLDİĞİNDE ===
        socket.on('send_message', async (data) => {
            const { roomId, authorId, authorRole, content } = data;
            
            try {
                const message = await prisma.chatMessage.create({
                    data: { roomId, authorId, authorRole, content }
                });

                // A. Mesajı, o odadaki herkese (kullanıcı ve admin) gönder
                io.to(roomId).emit('receive_message', message);

                // B. YENİ: Eğer mesajı gönderen KULLANICI ise, 
                //    tüm adminlere "yeni mesaj var" bildirimi gönder (SESLİ UYARI İÇİN)
                if (authorRole === 'user') {
                    io.to('admin_room').emit('admin_new_chat_message', message);
                }

            } catch (error) {
                console.error("Mesaj gönderme hatası:", error);
                socket.emit('chat_error', { message: 'Mesaj gönderilemedi.' });
            }
        });

        // Bağlantı kesildiğinde
        socket.on('disconnect', () => {
            console.log(`Kullanıcı ayrıldı: ${socket.id}`);
        });
    });
};

module.exports = initializeSocket;
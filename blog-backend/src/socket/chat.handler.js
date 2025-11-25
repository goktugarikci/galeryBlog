// blog-backend/src/socket/chat.handler.js
const prisma = require('../config/prisma'); 

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        
        // Admin Bağlantısı
        socket.on('admin_connected', () => {
            socket.join('admin_room');
        });

        // Odaya Katılma (Kullanıcı veya Misafir)
        socket.on('join_chat', async (data) => {
            const { userId, guestName } = data;
            let room;

            if (userId) {
                // Kayıtlı Kullanıcı
                room = await prisma.chatRoom.findFirst({
                    where: { userId: userId, status: 'open' }
                });
                if (!room) {
                    room = await prisma.chatRoom.create({
                        data: { userId: userId }
                    });
                }
            } else if (guestName) {
                // Misafir Kullanıcı (İlk mesajı isim olarak kabul etme mantığı burada işlenir)
                // Misafir için her seferinde yeni oda açıyoruz (veya localStorage ile ID takibi yapılabilir)
                room = await prisma.chatRoom.create({
                    data: { guestName: guestName }
                });
            }

            if (room) {
                socket.join(room.id);
                socket.emit('joined_room', { roomId: room.id, messages: [] }); // Geçmiş mesajlar eklenebilir
            }
        });

        // Admin Bir Odaya Katıldığında
        socket.on('admin_join_room', (data) => {
            socket.join(data.roomId);
        });

        // Mesaj Gönderme
        socket.on('send_message', async (data) => {
            const { roomId, authorId, authorRole, content } = data;
            
            try {
                const message = await prisma.chatMessage.create({
                    data: { 
                        roomId, 
                        authorId: authorId || null, // Misafir ise null
                        authorRole, 
                        content 
                    }
                });

                io.to(roomId).emit('receive_message', message);

                // Adminlere Bildirim (Eğer gönderen admin değilse)
                if (authorRole !== 'admin') {
                    io.to('admin_room').emit('admin_new_chat_message', message);
                }

            } catch (error) {
                console.error("Mesaj hatası:", error);
            }
        });
    });
};

module.exports = initializeSocket;
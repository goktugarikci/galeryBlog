// src/controllers/admin.controller.js
const prisma = require('../config/prisma'); // DİKKAT: Yolu ../config/prisma olarak düzelttiğinizden emin olun

// ===================================
// SİPARİŞ YÖNETİMİ (ADMIN)
// ===================================

/**
 * GET /api/admin/orders
 * Admin: Tüm siparişleri listeler (en yeniden eskiye).
 */
const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query; // ?status=pending ile filtreleme
        
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { // Siparişi veren kullanıcının temel bilgileri
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                items: true // Siparişin içeriği
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Siparişler getirilemedi: ' + error.message });
    }
};

/**
 * GET /api/admin/orders/:id
 * Admin: Tek bir siparişin detayını getirir.
 */
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: id },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                items: true
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı.' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Sipariş detayı getirilemedi: ' + error.message });
    }
};

/**
 * PUT /api/admin/orders/:id/status
 * Admin: Siparişin durumunu günceller (örn: "pending" -> "shipped").
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "processing", "shipped", "completed", "cancelled"

        if (!status) {
            return res.status(400).json({ error: 'Yeni "status" (durum) zorunludur.' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: id },
            data: { status: status }
        });
        
        // (Opsiyonel: Kullanıcıya 'Siparişiniz Kargolandı' bildirimi gönderilebilir)
        // await prisma.notification.create(...)
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: 'Sipariş durumu güncellenemedi: ' + error.message });
    }
};

/**
 * PUT /api/admin/orders/:id/payment
 * Admin: Siparişin ödeme durumunu günceller (örn: Havale onayı).
 */
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body; // "paid", "unpaid", "pending_confirmation"

        if (!paymentStatus) {
            return res.status(400).json({ error: 'Yeni "paymentStatus" (ödeme durumu) zorunludur.' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: id },
            data: { paymentStatus: paymentStatus }
        });

        // (Opsiyonel: Kullanıcıya 'Ödemeniz Onaylandı' bildirimi gönderilebilir)
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: 'Ödeme durumu güncellenemedi: ' + error.message });
    }
};

// ===================================
// KULLANICI YÖNETİMİ (ADMIN)
// ===================================

/**
 * GET /api/admin/users
 * Admin: Tüm kullanıcıları listeler.
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { // Asla şifreyi döndürme
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Kullanıcılar getirilemedi: ' + error.message });
    }
};

/**
 * PUT /api/admin/users/:id/role
 * Admin: Kullanıcının rolünü günceller (örn: "user" -> "admin").
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // "admin" veya "user"

        if (!role || (role !== 'admin' && role !== 'user')) {
            return res.status(400).json({ error: 'Geçerli bir rol ("admin" veya "user") zorunludur.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { role: role },
            select: { id: true, email: true, role: true } // Sadece güncellenen veriyi döndür
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Kullanıcı rolü güncellenemedi: ' + error.message });
    }
};


// ===================================
// CANLI DESTEK YÖNETİMİ (ADMIN)
// (Yüklediğiniz dosyada bu kısım eksikti)
// ===================================

/**
 * GET /api/admin/chats
 * Admin: Tüm "açık" canlı destek odalarını listeler.
 */
const getOpenChatRooms = async (req, res) => {
    try {
        const rooms = await prisma.chatRoom.findMany({
            // Hem açık hem kapalıları görmek isterseniz 'where' kısmını kaldırabilirsiniz
            // veya filtre ile alabilirsiniz. Şimdilik hepsini getirelim:
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
                messages: { 
                    orderBy: { createdAt: 'desc' },
                    take: 1 // Son mesajı göster
                },
                _count: { select: { messages: { where: { isRead: false, authorRole: { not: 'admin' } } } } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// YENİ: Sohbet Durumunu Güncelle (Kapat/Aç)
const updateChatStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'open' veya 'closed'
        await prisma.chatRoom.update({
            where: { id },
            data: { status }
        });
        res.json({ message: 'Sohbet durumu güncellendi.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// YENİ: Sohbeti Sil
const deleteChatRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.chatRoom.delete({ where: { id } });
        res.json({ message: 'Sohbet silindi.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/admin/chats/:roomId
 * Admin: Belirli bir sohbet odasının tüm mesaj geçmişini getirir.
 */
const getChatHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await prisma.chatMessage.findMany({
            where: { roomId: roomId },
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { firstName: true } } }
        });
        
        // Admin odaya girdiği anda tüm mesajları okundu say
        await prisma.chatMessage.updateMany({
            where: { roomId: roomId, isRead: false, authorRole: 'user' },
            data: { isRead: true }
        });
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Sohbet geçmişi getirilemedi: ' + error.message });
    }
};


module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    getAllUsers,
    updateUserRole,
    
    // Eksik olan fonksiyonlar:
    getOpenChatRooms,
    getChatHistory,
    updateChatStatus, // Eklendi
    deleteChatRoom    // Eklendi
};
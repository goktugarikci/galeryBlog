// src/controllers/notification.controller.js
const prisma = require('../config/prisma');

// ===================================
// KULLANICI BİLDİRİM İŞLEMLERİ
// ===================================

/**
 * GET /api/notifications
 * Giriş yapmış kullanıcının kendi bildirimlerini getirir (en yeniden).
 */
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma.notification.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Bildirimler getirilemedi: ' + error.message });
    }
};

/**
 * PUT /api/notifications/:id/read
 * Kullanıcının bir bildirimini "okundu" olarak işaretler.
 */
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params; // Bildirim ID'si
        const userId = req.user.id;

        const updatedNotification = await prisma.notification.updateMany({
            where: {
                id: id,
                userId: userId // Sadece kendi bildirimini okuyabilir
            },
            data: { isRead: true }
        });

        if (updatedNotification.count === 0) {
            return res.status(404).json({ error: 'Bildirim bulunamadı veya size ait değil.' });
        }
        res.status(200).json({ message: 'Bildirim okundu olarak işaretlendi.' });
    } catch (error) {
        res.status(500).json({ error: 'Bildirim güncellenemedi: ' + error.message });
    }
};

/**
 * PUT /api/notifications/read-all
 * Kullanıcının tüm okunmamış bildirimlerini "okundu" olarak işaretler.
 */
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false
            },
            data: { isRead: true }
        });
        res.status(200).json({ message: 'Tüm bildirimler okundu olarak işaretlendi.' });
    } catch (error) {
        res.status(500).json({ error: 'Bildirimler güncellenemedi: ' + error.message });
    }
};

/**
 * DELETE /api/notifications/:id
 * Kullanıcının bir bildirimini siler.
 */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await prisma.notification.deleteMany({
            where: {
                id: id,
                userId: userId // Sadece kendi bildirimini silebilir
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Bildirim bulunamadı veya size ait değil.' });
        }
        res.status(200).json({ message: 'Bildirim silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Bildirim silinemedi: ' + error.message });
    }
};


// ===================================
// ADMİN BİLDİRİM İŞLEMLERİ
// ===================================

/**
 * POST /api/notifications/admin-send
 * Admin: Özel duyuru veya bildirim gönderir.
 * (Tüm kullanıcılara veya spesifik bir kullanıcıya)
 */
const createAdminNotification = async (req, res) => {
    try {
        const { title, message, link, type, targetUserId } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: 'Başlık ve mesaj zorunludur.' });
        }

        if (targetUserId) {
            // --- Tek Bir Kullanıcıya Gönder ---
            const user = await prisma.user.findUnique({ where: { id: targetUserId }});
            if (!user) {
                return res.status(404).json({ error: 'Hedef kullanıcı bulunamadı.' });
            }
            await prisma.notification.create({
                data: { title, message, link, type: type || 'duyuru', userId: targetUserId }
            });
            res.status(201).json({ message: 'Bildirim başarıyla kullanıcıya gönderildi.' });

        } else {
            // --- Tüm Kullanıcılara Gönder (Duyuru) ---
            const users = await prisma.user.findMany({ select: { id: true } });
            if (users.length === 0) {
                return res.status(400).json({ error: 'Sistemde kayıtlı kullanıcı bulunmuyor.' });
            }

            const notificationData = users.map(user => ({
                title,
                message,
                link,
                type: type || 'duyuru',
                userId: user.id
            }));

            await prisma.notification.createMany({
                data: notificationData
            });
            res.status(201).json({ message: 'Bildirim tüm kullanıcılara başarıyla gönderildi.' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Bildirim gönderilemedi: ' + error.message });
    }
};


module.exports = {
    // Kullanıcı
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    // Admin
    createAdminNotification
};
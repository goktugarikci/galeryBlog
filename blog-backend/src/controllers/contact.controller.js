// src/controllers/contact.controller.js
const prisma = require('../config/prisma');

/**
 * POST /api/contact
 * Ziyaretçiden gelen iletişim formu gönderisini kaydeder.
 * Public.
 */
const createSubmission = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, subject, message } = req.body;

        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ error: 'Ad, soyad, e-posta, konu ve mesaj alanları zorunludur.' });
        }

        const submission = await prisma.contactSubmission.create({
            data: {
                firstName, lastName, email, phone, address, subject, message
            }
        });

        // === YENİ EKLEME: WebSocket Bildirimi ===
        // 1. index.js'te app'e eklediğimiz 'io' sunucusunu al
        const io = req.app.get('io');
        
        // 2. 'admin_room' odasındaki tüm adminlere yeni mesajı ilet
        if (io) {
            io.to('admin_room').emit('admin_new_contact_message', submission);
        }
        // === SON ===

        res.status(201).json({ message: 'Mesajınız başarıyla alındı. Teşekkür ederiz.' });

    } catch (error) {
        res.status(500).json({ error: 'Mesaj gönderilirken bir hata oluştu: ' + error.message });
    }
};

/**
 * GET /api/contact/admin
 * Adminin tüm iletişim formu gönderilerini görmesi.
 * Admin Korumalı.
 */
const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await prisma.contactSubmission.findMany({
            orderBy: {
                createdAt: 'desc' // En yeniden eskiye sırala
            }
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Mesajlar getirilemedi: ' + error.message });
    }
};

/**
 * PUT /api/contact/admin/:id/read
 * Bir mesajı "okundu" olarak işaretler.
 * Admin Korumalı.
 */
const markSubmissionAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await prisma.contactSubmission.update({
            where: { id: id },
            data: { isRead: true }
        });
        res.json(submission);
    } catch (error) {
        res.status(500).json({ error: 'Mesaj okundu olarak işaretlenemedi: ' + error.message });
    }
};

/**
 * DELETE /api/contact/admin/:id
 * Bir mesajı siler.
 * Admin Korumalı.
 */
const deleteSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.contactSubmission.delete({
            where: { id: id }
        });
        res.status(200).json({ message: 'Mesaj başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Mesaj silinemedi: ' + error.message });
    }
};


module.exports = {
    createSubmission,
    getAllSubmissions,
    markSubmissionAsRead,
    deleteSubmission
};
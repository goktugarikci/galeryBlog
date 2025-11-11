// src/routes/notification.routes.js
const router = require('express').Router();
const {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createAdminNotification
} = require('../controllers/notification.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- KULLANICI ROTALARI (Giriş yapmak zorunlu 'verifyToken') ---

/**
 * @route   GET /api/notifications
 * @desc    Giriş yapmış kullanıcının bildirimlerini listeler
 * @access  Private
 */
router.get('/', verifyToken, getMyNotifications);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Tüm bildirimleri okundu olarak işaretler
 * @access  Private
 */
router.put('/read-all', verifyToken, markAllNotificationsAsRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Tek bir bildirimi okundu olarak işaretler
 * @access  Private
 */
router.put('/:id/read', verifyToken, markNotificationAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Tek bir bildirimi siler
 * @access  Private
 */
router.delete('/:id', verifyToken, deleteNotification);


// --- ADMİN ROTASI ---

/**
 * @route   POST /api/notifications/admin-send
 * @desc    Admin: Tüm kullanıcılara veya tek kullanıcıya duyuru gönderir
 * @access  Private (Admin)
 */
router.post('/admin-send', verifyToken, isAdmin, createAdminNotification);


module.exports = router;
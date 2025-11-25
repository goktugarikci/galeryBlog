// src/routes/admin.routes.js
const router = require('express').Router();
const {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    getAllUsers,
    updateUserRole,
    getOpenChatRooms,
    getChatHistory,
    updateChatStatus,
    deleteChatRoom,
} = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- ÖNEMLİ ---
// Bu dosy_ADAKİ TÜM ROTALAR 'isAdmin' middleware'i ile korunmalıdır.
// Sadece 'admin' rolüne sahip kullanıcılar erişebilmelidir.

router.use(verifyToken, isAdmin); // Bu satır, altındaki TÜM rotaları korur

// --- Sipariş Yönetim Rotaları ---
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', updatePaymentStatus);

// --- Kullanıcı Yönetim Rotaları ---
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

router.get('/chats', getOpenChatRooms);
router.get('/chats/:roomId', getChatHistory);
router.put('/chats/:id/status', updateChatStatus); // YENİ
router.delete('/chats/:id', deleteChatRoom);       // YENİ

module.exports = router;
// src/routes/ecommerce.routes.js
const router = require('express').Router();
const { 
    getCart, 
    addToCart, 
    updateCartItemQuantity, 
    removeCartItem,
    createOrder,        // YENİ
    getOrderHistory     // YENİ
} = require('../../controllers/ecommerce.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// --- SEPET ROTALARI ---
// Tüm sepet rotaları giriş yapmış kullanıcı gerektirir (verifyToken)
router.get('/cart', verifyToken, getCart);
router.post('/cart', verifyToken, addToCart);
router.put('/cart/:itemId', verifyToken, updateCartItemQuantity);
router.delete('/cart/:itemId', verifyToken, removeCartItem);


// --- SİPARİŞ (CHECKOUT) ROTALARI ---

/**
 * @route   POST /api/shop/checkout
 * @desc    Sepeti siparişe dönüştürür.
 * @access  Private (verifyToken)
 */
router.post('/checkout', verifyToken, createOrder);

/**
 * @route   GET /api/shop/orders
 * @desc    Kullanıcının kendi sipariş geçmişini getirir.
 * @access  Private (verifyToken)
 */
router.get('/orders', verifyToken, getOrderHistory);

// (Opsiyonel: Tek bir siparişin detayını getirme)
// router.get('/orders/:id', verifyToken, getOrderDetail);


module.exports = router;
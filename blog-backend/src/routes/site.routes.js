// src/routes/site.routes.js
const router = require('express').Router();
const { getSettings, updateSettings } = require('../controllers/site.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/settings
 * @desc    Tüm site ayarlarını (renkler, seo, layout) getirir.
 * @access  Public
 * (Frontend'in sitenin nasıl görüneceğini bilmesi için public olmalıdır)
 */
router.get('/', getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Site ayarlarını günceller.
 * @access  Private (Sadece Admin)
 */
// Bu rotaya erişmek için kullanıcının:
// 1. Giriş yapmış olması (verifyToken)
// 2. Rolünün 'admin' olması (isAdmin) gerekir.
router.put('/', verifyToken, isAdmin, updateSettings);

module.exports = router;
// src/routes/page.routes.js
const router = require('express').Router();
const {
    createPage,
    getPageBySlug,
    getAllPages,
    updatePage,
    deletePage
} = require('../controllers/page.controller'); // DİKKAT: Yolu ../ olarak düzeltin
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- PUBLIC ROTA (Ziyaretçi) ---

/**
 * @route   GET /api/pages/:slug
 * @desc    Tek bir dinamik sayfayı getirir (örn: /api/pages/hakkimizda)
 * @access  Public
 */
router.get('/:slug', getPageBySlug);


// --- ADMİN ROTALARI ---

/**
 * @route   POST /api/pages
 * @desc    Yeni dinamik sayfa oluşturur
 * @access  Private (Admin)
 */
router.post('/', verifyToken, isAdmin, createPage);

/**
 * @route   GET /api/pages
 * @desc    Tüm dinamik sayfaları listeler
 * @access  Private (Admin)
 */
router.get('/', verifyToken, isAdmin, getAllPages);

/**
 * @route   PUT /api/pages/:id
 * @desc    Dinamik sayfayı günceller
 * @access  Private (Admin)
 */
router.put('/:id', verifyToken, isAdmin, updatePage);

/**
 * @route   DELETE /api/pages/:id
 * @desc    Dinamik sayfayı siler
 * @access  Private (Admin)
 */
router.delete('/:id', verifyToken, isAdmin, deletePage);

module.exports = router;
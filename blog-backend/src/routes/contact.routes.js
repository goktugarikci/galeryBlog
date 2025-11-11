// src/routes/contact.routes.js
const router = require('express').Router();
const { 
    createSubmission, 
    getAllSubmissions, 
    markSubmissionAsRead, 
    deleteSubmission 
} = require('../controllers/contact.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- ZİYARETÇİ ROTASI ---

/**
 * @route   POST /api/contact
 * @desc    İletişim formunu gönderir
 * @access  Public
 */
router.post('/', createSubmission);


// --- ADMİN YÖNETİM ROTALARI ---

/**
 * @route   GET /api/contact/admin
 * @desc    Tüm gönderilen formları listeler
 * @access  Private (Admin)
 */
router.get('/admin', verifyToken, isAdmin, getAllSubmissions);

/**
 * @route   PUT /api/contact/admin/:id/read
 * @desc    Bir mesajı okundu olarak işaretler
 * @access  Private (Admin)
 */
router.put('/admin/:id/read', verifyToken, isAdmin, markSubmissionAsRead);

/**
 * @route   DELETE /api/contact/admin/:id
 * @desc    Bir mesajı siler
 * @access  Private (Admin)
 */
router.delete('/admin/:id', verifyToken, isAdmin, deleteSubmission);

module.exports = router;
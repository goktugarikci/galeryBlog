// src/routes/upload.routes.js
const router = require('express').Router();
const { uploadSingleImage, uploadMultipleImages } = require('../controllers/upload.controller');
const upload = require('../middleware/upload.middleware');
const { verifyToken } = require('../middleware/auth.middleware');

// --- Rotalar ---

/**
 * @route   POST /api/upload/single
 * @desc    Tek bir resim yükler (örn: Slider, Blog öne çıkan görsel, Logo)
 * @access  Private (Giriş yapmış kullanıcı - 'verifyToken' ile korunuyor)
 * @field   'image' (Frontend'den gönderilecek form-data alanı)
 */
// 1. Token'ı kontrol et (verifyToken)
// 2. Dosyayı yakala ve kaydet (upload.single('image'))
// 3. URL'yi döndür (uploadSingleImage controller)
router.post('/single', verifyToken, upload.single('image'), uploadSingleImage);


/**
 * @route   POST /api/upload/multiple
 * @desc    Çoklu resim yükler (örn: Ürün galerisi)
 * @access  Private
 * @field   'gallery' (Frontend'den gönderilecek form-data alanı, max 10 adet)
 */
router.post('/multiple', verifyToken, upload.array('gallery', 10), uploadMultipleImages);


module.exports = router;
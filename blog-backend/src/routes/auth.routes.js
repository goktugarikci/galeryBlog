// src/routes/auth.routes.js
const router = require('express').Router();
// Controller'dan yeni fonksiyonları import et
const { register, login, getProfile, updateProfile } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Herkesin erişebileceği rotalar
router.post('/register', register);
router.post('/login', login);

// Sadece giriş yapmış kullanıcıların erişebileceği rotalar
router.get('/profile', verifyToken, getProfile); // Profil bilgilerini al
router.put('/profile', verifyToken, updateProfile); // Profil bilgilerini güncelle

module.exports = router;
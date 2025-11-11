// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// Kullanıcının token'ını doğrulayan middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN_STRING"

  if (!token) {
    return res.status(401).json({ error: 'Erişim reddedildi. Lütfen giriş yapın.' });
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Token'dan gelen userId ile kullanıcıyı veritabanında bul
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true } // Güvenlik için şifreyi alma
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // Kullanıcı bilgisini 'req' nesnesine ekle
    // Artık bu middleware'den sonraki tüm controller'lar 'req.user'a erişebilir
    req.user = user;
    next(); // Bir sonraki işleme (controller'a) geç

  } catch (error) {
    res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
};

// (Opsiyonel) Admin kontrolü middleware'i
const isAdmin = (req, res, next) => {
  // Bu middleware'in mutlaka 'verifyToken'dan sonra çalışması gerekir
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Erişim reddedildi. Admin yetkisi gerekli.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
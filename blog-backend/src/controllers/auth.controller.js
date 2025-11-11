// src/controllers/auth.controller.js
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'E-posta, şifre, ad ve soyad zorunludur.' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Bu e-posta zaten kullanılıyor.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, phone, address }
    });
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Kayıt işlemi başarısız: ' + error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı.' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      message: 'Giriş başarılı',
      token: token,
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Giriş işlemi başarısız: ' + error.message });
  }
};

// GET /api/auth/profile (Korumalı Rota)
const getProfile = async (req, res) => {
  // req.user, 'verifyToken' middleware'inden geliyor
  // Şifre olmadan tüm kullanıcı bilgilerini döndür
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true
    }
  });
  res.json(user);
};

// === YENİ EKLEME: KULLANICI GÜNCELLEME ===
// PUT /api/auth/profile (Korumalı Rota)
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;
        const userId = req.user.id; // Token'dan gelen kullanıcı ID'si

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                phone,
                address
            }
        });
        
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(200).json(userWithoutPassword);

    } catch (error) {
        res.status(500).json({ error: 'Profil güncellenemedi: ' + error.message });
    }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile // updateProfile'ı export et
};
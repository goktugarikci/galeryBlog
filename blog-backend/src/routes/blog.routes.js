// src/routes/blog.routes.js
const router = require('express').Router();
const { 
    createCategory, getAllCategories, updateCategory, deleteCategory,
    createSubCategory,
    createPost, getAllPosts, getPostById, updatePost, deletePost
} = require('../controllers/blog.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- Kategori Rotaları ---
router.get('/categories', getAllCategories); // Public
router.post('/categories', verifyToken, isAdmin, createCategory); // Admin
router.put('/categories/:id', verifyToken, isAdmin, updateCategory); // Admin
router.delete('/categories/:id', verifyToken, isAdmin, deleteCategory); // Admin

// --- Alt Kategori Rotaları ---
router.post('/subcategories', verifyToken, isAdmin, createSubCategory); // Admin
// (Diğer alt kategori rotaları...)

// --- Yazı (Post) Rotaları ---
router.get('/posts', getAllPosts); // Public
router.get('/posts/:id', getPostById); // Public
router.post('/posts', verifyToken, isAdmin, createPost); // Admin (veya yazar rolü)
router.put('/posts/:id', verifyToken, isAdmin, updatePost); // Admin
router.delete('/posts/:id', verifyToken, isAdmin, deletePost); // Admin

module.exports = router;
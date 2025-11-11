// src/controllers/blog.controller.js
const prisma = require('../config/prisma');

// ===================================
// BLOG KATEGORİLERİ (Category)
// ===================================

// POST /api/blog/categories
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Kategori oluşturulamadı: ' + error.message });
  }
};

// GET /api/blog/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Kategoriler getirilemedi.' });
  }
};

// PUT /api/blog/categories/:id
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedCategory = await prisma.category.update({
            where: { id: id },
            data: { name }
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: 'Kategori güncellenemedi: ' + error.message });
    }
};

// DELETE /api/blog/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // Not: İlişkili alt kategoriler varsa silme işlemi hata verebilir.
        // Gerçek bir uygulamada önce alt kategorileri silmek veya ayırmak gerekir.
        await prisma.category.delete({ where: { id: id } });
        res.status(200).json({ message: 'Kategori başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Kategori silinemedi: ' + error.message });
    }
};

// ===================================
// BLOG ALT KATEGORİLERİ (SubCategory)
// ===================================

// POST /api/blog/subcategories
const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const subCategory = await prisma.subCategory.create({
      data: { name, categoryId }
    });
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ error: 'Alt kategori oluşturulamadı: ' + error.message });
  }
};

// (getAllSubCategories, updateSubCategory, deleteSubCategory buraya eklenebilir...)


// ===================================
// BLOG YAZILARI (Post)
// ===================================

// POST /api/blog/posts
const createPost = async (req, res) => {
  try {
    const { title, content, featuredImage, excerpt, categoryId, subCategoryId } = req.body;
    const authorId = req.user.id; // Yazarın ID'si auth middleware'inden (token)

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        featuredImage, // Bu URL, /api/upload'dan alınmış olmalı
        excerpt,
        authorId,
        categoryId,
        subCategoryId
      }
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Yazı oluşturulamadı: ' + error.message });
  }
};

// GET /api/blog/posts (Public)
const getAllPosts = async (req, res) => {
  try {
    // (Filtreleme eklenebilir: ?category=id veya ?author=id)
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { firstName: true, lastName: true } }, // Yazarın adını al
        category: { select: { name: true } }, // Kategori adını al
        subCategory: { select: { name: true } }
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Yazılar getirilemedi: ' + error.message });
  }
};

// GET /api/blog/posts/:id (Public)
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: id },
      include: {
        author: { select: { firstName: true, lastName: true, email: true } },
        category: true,
        subCategory: true
      }
    });
    if (!post) {
      return res.status(404).json({ error: 'Yazı bulunamadı.' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Yazı getirilemedi: ' + error.message });
  }
};

// PUT /api/blog/posts/:id
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, featuredImage, excerpt, categoryId, subCategoryId } = req.body;
        
        // (Opsiyonel: Sadece admin VEYA yazının sahibi güncelleyebilir kontrolü)

        const updatedPost = await prisma.post.update({
            where: { id: id },
            data: { title, content, featuredImage, excerpt, categoryId, subCategoryId }
        });
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Yazı güncellenemedi: ' + error.message });
    }
};

// DELETE /api/blog/posts/:id
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.post.delete({ where: { id: id } });
        res.status(200).json({ message: 'Yazı başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Yazı silinemedi: ' + error.message });
    }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  createSubCategory,
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
};
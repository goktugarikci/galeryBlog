// src/controllers/blog.controller.js
const prisma = require('../config/prisma'); // DİKKAT: Yolu ../config/prisma olarak düzeltin

// ===================================
// BLOG KATEGORİLERİ (Çoklu Dil)
// ===================================

const createCategory = async (req, res) => {
  try {
    const { name_tr, name_en } = req.body;
    if (!name_tr) {
        return res.status(400).json({ error: "Kategori adı (name_tr) zorunludur." });
    }
    const category = await prisma.category.create({ data: { name_tr, name_en } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Kategori oluşturulamadı: ' + error.message });
  }
};

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

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name_tr, name_en } = req.body;
        const updatedCategory = await prisma.category.update({
            where: { id: id },
            data: { name_tr, name_en }
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: 'Kategori güncellenemedi: ' + error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await prisma.category.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Kategori başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Kategori silinemedi: ' + error.message });
    }
};

// ===================================
// BLOG ALT KATEGORİLERİ (Çoklu Dil)
// ===================================

const createSubCategory = async (req, res) => {
  try {
    const { name_tr, name_en, categoryId } = req.body;
    if (!name_tr || !categoryId) {
        return res.status(400).json({ error: 'Alt kategori adı (name_tr) ve ana kategori ID (categoryId) zorunludur.' });
    }
    const subCategory = await prisma.subCategory.create({
      data: { name_tr, name_en, categoryId }
    });
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ error: 'Alt kategori oluşturulamadı: ' + error.message });
  }
};

// ===================================
// BLOG YAZILARI (Çoklu Dil)
// ===================================

const createPost = async (req, res) => {
  try {
    const { 
        title_tr, title_en, 
        content_tr, content_en, 
        excerpt_tr, excerpt_en,
        featuredImage, categoryId, subCategoryId 
    } = req.body;
    const authorId = req.user.id;

    if (!title_tr || !content_tr) {
        return res.status(400).json({ error: 'TR Başlık (title_tr) ve TR İçerik (content_tr) zorunludur.' });
    }

    const newPost = await prisma.post.create({
      data: {
        title_tr, title_en,
        content_tr, content_en,
        excerpt_tr, excerpt_en,
        featuredImage,
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

const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: { select: { name_tr: true, name_en: true } },
        subCategory: { select: { name_tr: true, name_en: true } }
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Yazılar getirilemedi: ' + error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
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

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title_tr, title_en, 
            content_tr, content_en, 
            excerpt_tr, excerpt_en,
            featuredImage, categoryId, subCategoryId 
        } = req.body;
        
        const updatedPost = await prisma.post.update({
            where: { id: id },
            data: { 
                title_tr, title_en, 
                content_tr, content_en, 
                excerpt_tr, excerpt_en,
                featuredImage, categoryId, subCategoryId
            }
        });
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Yazı güncellenemedi: ' + error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        await prisma.post.delete({ where: { id: req.params.id } });
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
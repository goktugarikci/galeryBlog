// src/controllers/page.controller.js
const prisma = require('../config/prisma'); // DİKKAT: Yolu ../config/prisma olarak düzeltin

/**
 * POST /api/pages
 * Yeni bir dinamik sayfa oluşturur (Hakkımızda vb.)
 * ÇOKLU DİL UYUMLU.
 * Admin Korumalı.
 */
const createPage = async (req, res) => {
    try {
        const { 
            title_tr, title_en,
            slug, 
            layoutJson_tr, layoutJson_en,
            sliderImages // [{ imageUrl: "url1", caption_tr: "a", caption_en: "b" }, ...]
        } = req.body;

        if (!title_tr || !slug) {
            return res.status(400).json({ error: 'Sayfa TR başlığı (title_tr) ve URL (slug) zorunludur.' });
        }

        const newPage = await prisma.dynamicPage.create({
            data: {
                title_tr,
                title_en,
                slug,
                layoutJson_tr,
                layoutJson_en,
                // İlişkili slider görsellerini de çoklu dilde oluştur
                sliderImages: sliderImages ? {
                    create: sliderImages.map((img, index) => ({
                        imageUrl: img.imageUrl,
                        caption_tr: img.caption_tr,
                        caption_en: img.caption_en,
                        order: img.order || index
                    }))
                } : undefined
            },
            include: { sliderImages: true }
        });
        res.status(201).json(newPage);

    } catch (error) {
        if (error.code === 'P2002') { // Benzersiz alan (slug) çakışması
            return res.status(409).json({ error: 'Bu URL (slug) zaten kullanılıyor.' });
        }
        res.status(500).json({ error: 'Sayfa oluşturulamadı: ' + error.message });
    }
};

/**
 * GET /api/pages/:slug
 * Bir dinamik sayfayı URL'sine (slug) göre getirir.
 * Public. (Tüm dil alanlarını döndürür)
 */
const getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await prisma.dynamicPage.findUnique({
            where: { slug: slug },
            include: {
                sliderImages: { // Sayfaya özel slider'ı getir
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!page) {
            return res.status(404).json({ error: 'Sayfa bulunamadı.' });
        }
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: 'Sayfa getirilemedi: ' + error.message });
    }
};

/**
 * GET /api/pages
 * Tüm dinamik sayfaları listeler (Admin paneli için).
 * Admin Korumalı.
 */
const getAllPages = async (req, res) => {
    try {
        const pages = await prisma.dynamicPage.findMany({
            orderBy: { createdAt: 'desc' },
            select: { 
                id: true, 
                title_tr: true, // Listede TR başlığı göster
                slug: true, 
                createdAt: true 
            }
        });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: 'Sayfalar getirilemedi: ' + error.message });
    }
};

/**
 * PUT /api/pages/:id
 * Bir dinamik sayfayı günceller.
 * ÇOKLU DİL UYUMLU.
 * Admin Korumalı.
 */
const updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title_tr, title_en,
            slug, 
            layoutJson_tr, layoutJson_en 
        } = req.body;
        
        // Not: Slider güncellemesi (silme/ekleme) ayrı bir endpoint gerektirebilir
        
        const updatedPage = await prisma.dynamicPage.update({
            where: { id: id },
            data: { 
                title_tr, title_en,
                slug, 
                layoutJson_tr, layoutJson_en
            }
        });
        res.json(updatedPage);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Bu URL (slug) zaten kullanılıyor.' });
        }
        res.status(500).json({ error: 'Sayfa güncellenemedi: ' + error.message });
    }
};

/**
 * DELETE /api/pages/:id
 * Bir dinamik sayfayı siler.
 * Admin Korumalı.
 */
const deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        // 'onDelete: Cascade' sayesinde ilişkili slider görselleri de silinir.
        await prisma.dynamicPage.delete({ where: { id: id } });
        res.status(200).json({ message: 'Sayfa başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Sayfa silinemedi: ' + error.message });
    }
};

module.exports = {
    createPage,
    getPageBySlug,
    getAllPages,
    updatePage,
    deletePage
};
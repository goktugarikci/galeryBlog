// src/controllers/page.controller.js
const prisma = require('../config/prisma');

/**
 * POST /api/pages
 * Yeni bir dinamik sayfa oluşturur.
 * (Slider ayarları ve görselleri dahil)
 */
const createPage = async (req, res) => {
    try {
        const { 
            title_tr, title_en,
            slug, 
            layoutJson_tr, layoutJson_en,
            
            // Yeni Slider Ayarları
            sliderEnabled, 
            sliderPosition,
            sliderHeightPx_mobile, 
            sliderHeightPx_desktop, 
            sliderObjectFit,
            
            
            // Slider Görselleri (Array)
            sliderImages 
        } = req.body;

        // Zorunlu alan kontrolü
        if (!title_tr || !slug) {
            return res.status(400).json({ error: 'Sayfa başlığı (TR) ve URL (slug) zorunludur.' });
        }

        // Slug benzersizlik kontrolü
        const existingPage = await prisma.dynamicPage.findUnique({ where: { slug } });
        if (existingPage) {
            return res.status(409).json({ error: 'Bu URL (slug) zaten kullanılıyor.' });
        }

        const newPage = await prisma.dynamicPage.create({
            data: {
                title_tr,
                title_en,
                slug,
                layoutJson_tr,
                layoutJson_en,
                
                // Slider Ayarları (Varsayılan değerler schema'da olsa da buraya ekliyoruz)
                sliderEnabled: sliderEnabled ?? false, 
                sliderPosition: sliderPosition || "top",
                sliderHeightPx_mobile: sliderHeightPx_mobile ? parseInt(sliderHeightPx_mobile) : 200,
                sliderHeightPx_desktop: sliderHeightPx_desktop ? parseInt(sliderHeightPx_desktop) : 400,
                sliderObjectFit: sliderObjectFit || "cover",
                

                // İlişkili slider görsellerini oluştur
                sliderImages: sliderImages && sliderImages.length > 0 ? {
                    create: sliderImages.map((img, index) => ({
                        imageUrl: img.imageUrl,
                        caption_tr: img.caption_tr,
                        caption_en: img.caption_en,
                        description_tr: img.description_tr,
                        description_en: img.description_en,
                        order: img.order !== undefined ? img.order : index // Sıralama verisi varsa kullan yoksa index
                    }))
                } : undefined
            },
            include: { sliderImages: true }
        });

        res.status(201).json(newPage);

    } catch (error) {
        console.error("Sayfa oluşturma hatası:", error);
        res.status(500).json({ error: 'Sayfa oluşturulamadı: ' + error.message });
    }
};

/**
 * PUT /api/pages/:id
 * Mevcut bir sayfayı günceller.
 * (Slider görsellerini tamamen yeniler)
 */
const updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title_tr, title_en,
            slug, 
            layoutJson_tr, layoutJson_en,
            sliderEnabled, 
            sliderPosition,
            sliderHeightPx_mobile, 
            sliderHeightPx_desktop, 
            sliderObjectFit,
            sliderImages 
        } = req.body;
        
        // Slug değişiyorsa çakışma kontrolü
        if (slug) {
            const existingSlug = await prisma.dynamicPage.findUnique({ where: { slug } });
            if (existingSlug && existingSlug.id !== id) {
                return res.status(409).json({ error: 'Bu URL (slug) başka bir sayfa tarafından kullanılıyor.' });
            }
        }

        // Slider güncelleme stratejisi:
        // En temiz yöntem, eski resimleri silip yeni gelen listeyi oluşturmaktır.
        // Bu sayede sıralama veya silinen resimler otomatik olarak senkronize olur.
        
        // 1. Bu sayfaya ait eski resimleri sil
        await prisma.dynamicPageSliderImage.deleteMany({
            where: { dynamicPageId: id }
        });

        // 2. Sayfayı ve yeni resimleri güncelle
        const updatedPage = await prisma.dynamicPage.update({
            where: { id: id },
            data: { 
                title_tr, title_en,
                slug, 
                layoutJson_tr, layoutJson_en,
                sliderEnabled, 
                sliderPosition,
                sliderHeightPx_mobile: sliderHeightPx_mobile ? parseInt(sliderHeightPx_mobile) : null,
                sliderHeightPx_desktop: sliderHeightPx_desktop ? parseInt(sliderHeightPx_desktop) : null,
                sliderObjectFit,
                
                // Yeni resim setini oluştur
                sliderImages: sliderImages && sliderImages.length > 0 ? {
                    create: sliderImages.map((img, index) => ({
                        imageUrl: img.imageUrl,
                        caption_tr: img.caption_tr,
                        caption_en: img.caption_en,
                        description_tr: img.description_tr,
                        description_en: img.description_en,
                        order: index
                    }))
                } : undefined
            },
            include: { sliderImages: { orderBy: { order: 'asc' } } }
        });

        res.json(updatedPage);

    } catch (error) {
        console.error("Sayfa güncelleme hatası:", error);
        res.status(500).json({ error: 'Sayfa güncellenemedi: ' + error.message });
    }
};

/**
 * GET /api/pages/:slug
 * Tek bir sayfayı URL'sine göre getirir (Public).
 */
const getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await prisma.dynamicPage.findUnique({
            where: { slug: slug },
            include: {
                sliderImages: { 
                    orderBy: { order: 'asc' } // Resimleri sırasına göre getir
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
 * Tüm sayfaları listeler (Admin listesi için özet).
 */
const getAllPages = async (req, res) => {
    try {
        const pages = await prisma.dynamicPage.findMany({
            orderBy: { createdAt: 'desc' },
            select: { 
                id: true, 
                title_tr: true, 
                slug: true, 
                createdAt: true,
                sliderEnabled: true // Listede slider durumunu görmek isterseniz
            }
        });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: 'Sayfalar getirilemedi: ' + error.message });
    }
};

/**
 * DELETE /api/pages/:id
 * Bir sayfayı siler.
 */
const deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        // 'onDelete: Cascade' şemada tanımlı olduğu için ilişkili resimler de silinir
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
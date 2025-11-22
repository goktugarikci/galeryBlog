// blog-backend/src/controllers/campaign.controller.js
const prisma = require('../config/prisma');

// Kampanya Oluştur
const createCampaign = async (req, res) => {
    try {
        const { title_tr, title_en, slug, description_tr, description_en, isActive, productIds } = req.body;

        if (!title_tr || !slug) {
            return res.status(400).json({ error: 'Başlık (TR) ve Slug zorunludur.' });
        }

        const campaign = await prisma.campaign.create({
            data: {
                title_tr, title_en, slug, description_tr, description_en, 
                isActive: isActive ?? true,
                // Seçilen ürünleri bağla
                products: productIds && productIds.length > 0 ? {
                    connect: productIds.map(id => ({ id }))
                } : undefined
            },
            include: { products: true }
        });
        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Kampanya oluşturulamadı: ' + error.message });
    }
};

// Tüm Kampanyaları Getir (Admin için)
const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { products: true } } } // Ürün sayısını göster
        });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Tek Kampanya Getir (Slug ile - Public)
const getCampaignBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const campaign = await prisma.campaign.findUnique({
            where: { slug },
            include: { 
                products: { 
                    where: { status: 'published' }, // Sadece yayındaki ürünler
                    include: { galleryImages: { take: 1 } } 
                } 
            }
        });
        
        if (!campaign) return res.status(404).json({ error: 'Kampanya bulunamadı.' });
        // Eğer aktif değilse ve admin değilse (basit kontrol) gösterme
        if (!campaign.isActive) return res.status(404).json({ error: 'Bu kampanya aktif değil.' });

        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Kampanya Güncelle
const updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const { title_tr, title_en, slug, description_tr, description_en, isActive, productIds } = req.body;

        const updateData = {
            title_tr, title_en, slug, description_tr, description_en, isActive
        };

        // Ürün listesi geldiyse güncelle (Eskileri kopar, yenileri bağla)
        if (productIds) {
            updateData.products = {
                set: productIds.map(id => ({ id }))
            };
        }

        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: updateData,
            include: { products: true }
        });
        res.json(updatedCampaign);
    } catch (error) {
        res.status(500).json({ error: 'Güncellenemedi: ' + error.message });
    }
};

// Kampanya Sil
const deleteCampaign = async (req, res) => {
    try {
        await prisma.campaign.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Kampanya silindi.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCampaign, getAllCampaigns, getCampaignBySlug, updateCampaign, deleteCampaign };
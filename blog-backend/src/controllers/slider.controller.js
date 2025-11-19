// src/controllers/slider.controller.js
const prisma = require('../config/prisma');

/**
 * POST /api/slider
 * ÇOKLU DİL GÜNCELLENDİ
 */
const createSlider = async (req, res) => {
    try {
        // 'caption' yerine 'caption_tr' ve 'caption_en' alındı
        const { imageUrl, caption_tr, caption_en, linkUrl, order } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Görsel URL (imageUrl) zorunludur.' });
        }

        const newSlider = await prisma.sliderImage.create({
            data: {
                imageUrl,
                caption_tr, // Güncellendi
                caption_en, // Güncellendi
                linkUrl,
                order: order || 0
            }
        });
        res.status(201).json(newSlider);

    } catch (error) {
        res.status(500).json({ error: 'Slider öğesi oluşturulamadı: ' + error.message });
    }
};

/**
 * GET /api/slider
 * (Değişiklik gerekmez, tüm alanları döndürür)
 */
const getAllSliders = async (req, res) => {
    try {
        const sliders = await prisma.sliderImage.findMany({
            orderBy: {
                order: 'asc' // Sıralamaya göre getir
            }
        });
        res.json(sliders);
    } catch (error) {
        res.status(500).json({ error: 'Slider öğeleri getirilemedi: ' + error.message });
    }
};

/**
 * PUT /api/slider/:id
 * ÇOKLU DİL GÜNCELLENDİ
 */
const updateSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl, caption_tr, caption_en, linkUrl, order } = req.body;

        const updatedSlider = await prisma.sliderImage.update({
            where: { id: id },
            data: {
                imageUrl,
                caption_tr, // Güncellendi
                caption_en, // Güncellendi
                linkUrl,
                order
            }
        });
        res.json(updatedSlider);
    } catch (error) {
        res.status(500).json({ error: 'Slider öğesi güncellenemedi: ' + error.message });
    }
};

/**
 * DELETE /api/slider/:id
 * (Değişiklik gerekmez)
 */
const deleteSlider = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.sliderImage.delete({
            where: { id: id }
        });
        res.status(200).json({ message: 'Slider öğesi başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Slider öğesi silinemedi: ' + error.message });
    }
};

module.exports = {
    createSlider,
    getAllSliders,
    updateSlider,
    deleteSlider
};
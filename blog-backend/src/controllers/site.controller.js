// src/controllers/site.controller.js
const prisma = require('../config/prisma');

// Ayarları getiren veya yoksa oluşturan yardımcı fonksiyon
const getOrCreateSettings = async () => {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    // Veritabanında hiç ayar yoksa, varsayılan şema değerleriyle ilk ayarı oluştur.
    console.log('İlk site ayarları oluşturuluyor...');
    settings = await prisma.siteSettings.create({
      data: {
        // schema.prisma'daki @default değerleri
        // (örn: Sarı/Siyah tema) otomatik olarak uygulanacaktır.
      }
    });
  }
  return settings;
};

/**
 * GET /api/settings
 * Tüm site ayarlarını getirir. (Public)
 * Frontend'in renkleri ve SEO'yu çekmesi için kullanılır.
 */
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Ayarlar getirilemedi: ' + error.message });
  }
};

/**
 * PUT /api/settings
 * Site ayarlarını günceller. (Admin Korumalı)
 * Yönetici panelinden gelen verileri kaydeder.
 */
const updateSettings = async (req, res) => {
  try {
    // Güncellenmesine izin verilen tüm alanlar
    const {
      siteName,
      logoUrl,
      navLinksJson,
      footerText,
      homeLayout,
      
      // Ana Tema Renkleri
      colorPrimary,
      colorSecondary,
      colorBackground,
      colorText,

      // E-Ticaret Buton Renkleri
      colorButtonAddToCart,
      colorButtonAddToCartText,
      colorButtonBuyNow,
      colorButtonBuyNowText,

      // SEO
      seoTitle,
      seoDescription,
      seoKeywords,
      seoAuthor
    } = req.body;

    // Ayarların mevcut ID'sini al
    const currentSettings = await getOrCreateSettings();

    const updatedSettings = await prisma.siteSettings.update({
      where: { id: currentSettings.id },
      data: {
        siteName,
        logoUrl,
        navLinksJson,
        footerText,
        homeLayout,
        
        // Renkler
        colorPrimary,
        colorSecondary,
        colorBackground,
        colorText,

        // Buton Renkleri
        colorButtonAddToCart,
        colorButtonAddToCartText,
        colorButtonBuyNow,
        colorButtonBuyNowText,
        
        // SEO
        seoTitle,
        seoDescription,
        seoKeywords,
        seoAuthor
      }
    });
    
    res.json(updatedSettings);

  } catch (error) {
    res.status(500).json({ error: 'Ayarlar güncellenemedi: ' + error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
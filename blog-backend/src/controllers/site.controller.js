// src/controllers/site.controller.js
const prisma = require('../config/prisma'); // DİKKAT: Yolu ../config/prisma olarak düzeltin

// Ayarları getiren veya yoksa oluşturan yardımcı fonksiyon
const getOrCreateSettings = async () => {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    console.log('İlk site ayarları oluşturuluyor...');
    settings = await prisma.siteSettings.create({ data: {} });
  }
  return settings;
};

/**
 * GET /api/settings
 * Tüm site ayarlarını getirir. (Public)
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
 * DİL AYARI EKLENDİ.
 */
const updateSettings = async (req, res) => {
  try {
    const {
      siteName, logoUrl, navLinksJson, footerText, homeLayout,
      
      // Dil Ayarı
      enableEnglish,

      // Düzen Ayarları
      navLayout, footerLinksJson,

      // Renkler
      colorPrimary, colorSecondary, colorBackground, colorText,
      colorButtonAddToCart, colorButtonAddToCartText, colorButtonBuyNow, colorButtonBuyNowText,

      // SEO
      seoTitle, seoDescription, seoKeywords, seoAuthor,

      // E-ticaret Modu
      eCommerceEnabled, whatsAppNumber, whatsAppMessageTemplate
    } = req.body;

    const currentSettings = await getOrCreateSettings();

    const updatedSettings = await prisma.siteSettings.update({
      where: { id: currentSettings.id },
      data: {
        siteName, logoUrl, navLinksJson, footerText, homeLayout,
        enableEnglish, // YENİ
        navLayout, footerLinksJson, // YENİ (Dinamik sayfa modülü için)
        colorPrimary, colorSecondary, colorBackground, colorText,
        colorButtonAddToCart, colorButtonAddToCartText, colorButtonBuyNow, colorButtonBuyNowText,
        seoTitle, seoDescription, seoKeywords, seoAuthor,
        eCommerceEnabled, whatsAppNumber, whatsAppMessageTemplate // YENİ (E-ticaret modu için)
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
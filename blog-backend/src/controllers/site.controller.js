// src/controllers/site.controller.js
const prisma = require('../config/prisma');

// Yardımcı Fonksiyon: Ayarlar yoksa oluştur, varsa getir
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
 * Tüm site ayarlarını getirir.
 * Erişim: Public (Herkes görebilir)
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
 * Site ayarlarını günceller.
 * Erişim: Private (Sadece Admin)
 */
const updateSettings = async (req, res) => {
  try {
    const {
      // --- Genel Ayarlar ---
      siteName, 
      logoUrl, 
      footerText, 
      
      // --- Dil ve Mod Ayarları ---
      enableEnglish,
      showHomeSlider,    // <--- BU ALAN SLIDER'I AÇIP KAPATIR
      eCommerceEnabled,
      
      // --- İletişim ve Düzen ---
      whatsAppNumber,
      whatsAppMessageTemplate,
      navLayout, 
      navLinksJson, 
      footerLinksJson, 
      homeLayout,

      // --- Tema Renkleri ---
      colorPrimary, 
      colorSecondary, 
      colorBackground, 
      colorText,
      colorButtonAddToCart, 
      colorButtonAddToCartText, 
      colorButtonBuyNow, 
      colorButtonBuyNowText,
      colorCardBackground,
      colorCardText,

      // --- SEO Ayarları ---
      seoTitle, 
      seoDescription, 
      seoKeywords, 
      seoAuthor,

      // --- Ödeme Yöntemi Ayarları ---
      paymentCashEnabled,
      paymentIbanEnabled,
      paymentIbanInfo,
      paymentPosEnabled,
      paymentPosApiKey,
      paymentPosSecretKey,
      paymentPosBaseUrl

    } = req.body;

    const currentSettings = await getOrCreateSettings();

    const updatedSettings = await prisma.siteSettings.update({
      where: { id: currentSettings.id },
      data: {
        // Genel
        siteName, logoUrl, footerText,
        
        // Modlar
        enableEnglish,
        showHomeSlider, // <--- VERİTABANINA KAYIT
        eCommerceEnabled,
        
        // İletişim / Düzen
        whatsAppNumber, whatsAppMessageTemplate,
        navLayout, navLinksJson, footerLinksJson, homeLayout,

        // Renkler
        colorPrimary, colorSecondary, colorBackground, colorText,
        colorButtonAddToCart, colorButtonAddToCartText, colorButtonBuyNow, colorButtonBuyNowText,colorCardBackground,
        colorCardText,

        // SEO
        seoTitle, seoDescription, seoKeywords, seoAuthor,

        // Ödeme
        paymentCashEnabled,
        paymentIbanEnabled,
        paymentIbanInfo,
        paymentPosEnabled,
        paymentPosApiKey,
        paymentPosSecretKey,
        paymentPosBaseUrl
      }
    });
    
    res.json(updatedSettings);

  } catch (error) {
    console.error("Ayarlar güncellenirken hata:", error);
    res.status(500).json({ error: 'Ayarlar güncellenemedi: ' + error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
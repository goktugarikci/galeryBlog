// src/controllers/product.controller.js
const prisma = require('../config/prisma');

// ===================================
// ÜRÜN KATEGORİLERİ (Çoklu Dil)
// ===================================

const createProductCategory = async (req, res) => {
  try {
    const { name_tr, name_en, description_tr, description_en } = req.body;
    if (!name_tr) {
      return res.status(400).json({ error: 'Kategori adı (name_tr) zorunludur.' });
    }
    const category = await prisma.productCategory.create({ 
      data: { name_tr, name_en, description_tr, description_en } 
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Ürün kategorisi oluşturulamadı: ' + error.message });
  }
};

const getAllProductCategories = async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      include: { subCategories: true }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Ürün kategorileri getirilemedi.' });
  }
};

const updateProductCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name_tr, name_en, description_tr, description_en } = req.body;
        const updatedCategory = await prisma.productCategory.update({
            where: { id: id },
            data: { name_tr, name_en, description_tr, description_en }
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: 'Ürün kategorisi güncellenemedi: ' + error.message });
    }
};

const deleteProductCategory = async (req, res) => {
    try {
        await prisma.productCategory.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Ürün kategorisi başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Ürün kategorisi silinemedi: ' + error.message });
    }
};

// ===================================
// ÜRÜN ALT KATEGORİLERİ
// ===================================

const createProductSubCategory = async (req, res) => {
  try {
    const { name_tr, name_en, description_tr, description_en, categoryId } = req.body;
    if (!name_tr || !categoryId) {
      return res.status(400).json({ error: 'Alt kategori adı (name_tr) ve ana kategori ID (categoryId) zorunludur.' });
    }
    const subCategory = await prisma.productSubCategory.create({
      data: { name_tr, name_en, description_tr, description_en, categoryId }
    });
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ error: 'Ürün alt kategorisi oluşturulamadı: ' + error.message });
  }
};

const updateProductSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name_tr, name_en, description_tr, description_en, categoryId } = req.body;
        const updatedSubCategory = await prisma.productSubCategory.update({
            where: { id: id },
            data: { name_tr, name_en, description_tr, description_en, categoryId }
        });
        res.json(updatedSubCategory);
    } catch (error) {
        res.status(500).json({ error: 'Alt kategori güncellenemedi: ' + error.message });
    }
};

const deleteProductSubCategory = async (req, res) => {
    try {
        await prisma.productSubCategory.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Alt kategori başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Alt kategori silinemedi: ' + error.message });
    }
};

// ===================================
// ÜRÜNLER (Çoklu Dil ve Özellikler)
// ===================================

const createProduct = async (req, res) => {
  try {
    const { 
        // Temel Alanlar
        name_tr, name_en, 
        description_tr, description_en, 
        shortDescription_tr, shortDescription_en,
        price, originalPrice, discountLabel,
        sku, stock, status, 
        subCategoryId, 
        
        // İlişkiler
        galleryImages, // [{ imageUrl: "...", altText: "..." }]
        features       // [{ key_tr: "Renk", value_tr: "Kırmızı", ... }]
    } = req.body;

    if (!name_tr || !description_tr || !price) {
        return res.status(400).json({ error: 'TR Ad, TR Açıklama ve Fiyat zorunludur.' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name_tr, name_en,
        description_tr, description_en,
        shortDescription_tr, shortDescription_en,
        price, originalPrice, discountLabel,
        sku, stock, status,
        subCategoryId,
        
        // Galeri Resimlerini Kaydet
        galleryImages: galleryImages ? {
          create: galleryImages.map(img => ({
            imageUrl: img.imageUrl,
            altText: img.altText || name_tr,
            order: img.order || 0
          }))
        } : undefined,

        // YENİ: Ürün Özelliklerini Kaydet
        features: features && features.length > 0 ? {
            create: features.map(f => ({
                key_tr: f.key_tr,
                value_tr: f.value_tr,
                key_en: f.key_en,
                value_en: f.value_en
            }))
        } : undefined
      },
      include: { galleryImages: true, features: true }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürün oluşturulamadı: ' + error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // 1. Query parametrelerini al (sort eklendi)
    const { subCategory, categoryId, minPrice, maxPrice, sort } = req.query;
    
    const whereClause = { status: 'published' }; // Sadece yayınlananlar
    
    // --- KATEGORİ FİLTRELERİ ---
    if (subCategory) {
      whereClause.subCategoryId = subCategory;
    }
    if (categoryId && !subCategory) {
       whereClause.subCategory = { categoryId: categoryId };
    }

    // --- FİYAT FİLTRESİ ---
    if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price.gte = parseFloat(minPrice);
        if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }

    // --- SIRALAMA (SORTING) ---
    let orderBy = { createdAt: 'desc' }; // Varsayılan: En Yeni (Önerilen)
    
    if (sort === 'oldest') {
        orderBy = { createdAt: 'asc' };
    } else if (sort === 'price_asc') {
        orderBy = { price: 'asc' }; // Fiyat Artan
    } else if (sort === 'price_desc') {
        orderBy = { price: 'desc' }; // Fiyat Azalan
    }
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        subCategory: { 
            select: { 
                name_tr: true, name_en: true,
                category: { select: { name_tr: true, name_en: true } }
            } 
        },
        galleryImages: { take: 1, orderBy: { order: 'asc' } }
      },
      orderBy: orderBy // Dinamik sıralama
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ürünler getirilemedi: ' + error.message });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        galleryImages: { orderBy: { order: 'asc' } },
        features: true, // Özellikleri getir
        subCategory: { include: { category: true } }
      }
    });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı.' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ürün getirilemedi: ' + error.message });
  }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name_tr, name_en, 
            description_tr, description_en, 
            shortDescription_tr, shortDescription_en,
            price, originalPrice, discountLabel,
            sku, stock, status, subCategoryId,
            features // Güncellenecek özellikler
        } = req.body;
        
        // Güncelleme işlemi (Transaction kullanılabilir ama basitlik için direct update)
        // Özellikleri güncellemek için en temiz yol: Eskileri silip yenileri eklemektir.
        
        // 1. Önce ürünün temel bilgilerini güncelle
        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: { 
                name_tr, name_en, 
                description_tr, description_en, 
                shortDescription_tr, shortDescription_en,
                price, originalPrice, discountLabel,
                sku, stock, status, subCategoryId,
                
                // Özellikleri Güncelle (Sil ve Yeniden Oluştur Stratejisi)
                features: features ? {
                    deleteMany: {}, // Bu ürüne ait tüm özellikleri sil
                    create: features.map(f => ({
                        key_tr: f.key_tr,
                        value_tr: f.value_tr,
                        key_en: f.key_en,
                        value_en: f.value_en
                    }))
                } : undefined
            },
            include: { features: true }
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Ürün güncellenemedi: ' + error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        // İlişkili resimler ve özellikler 'onDelete: Cascade' ile otomatik silinir
        await prisma.product.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Ürün başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Ürün silinemedi: ' + error.message });
    }
};

// ===================================
// KAMPANYA / İNDİRİM İŞLEMLERİ
// ===================================

const applyDiscount = async (req, res) => {
    const { id } = req.params;
    const { type, value } = req.body;

    if (!type || !value || value <= 0) {
        return res.status(400).json({ error: "Geçersiz indirim değeri." });
    }
    try {
        const product = await prisma.product.findUnique({ where: { id: id } });
        if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });

        const basePrice = product.originalPrice || product.price; 
        let newPrice, discountLabel;

        if (type === "percentage") {
            newPrice = basePrice - (basePrice * (value / 100));
            discountLabel = `%${value} İndirim`;
        } else if (type === "fixed") {
            newPrice = basePrice - value;
            const percentOff = Math.round(((basePrice - newPrice) / basePrice) * 100);
            discountLabel = `${value} TL İndirim (%${percentOff})`;
        } else {
            return res.status(400).json({ error: "Geçersiz indirim tipi." });
        }
        
        if (newPrice < 0) newPrice = 0;

        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: { price: newPrice, originalPrice: basePrice, discountLabel: discountLabel }
        });

        // Bildirim Gönder (Opsiyonel)
        const users = await prisma.user.findMany({ select: { id: true } });
        if (users.length > 0) {
            await prisma.notification.createMany({
                data: users.map(user => ({
                    title: "İndirim Fırsatı!",
                    message: `${product.name_tr} şimdi indirimde!`,
                    link: `/products/${product.id}`,
                    type: "indirim",
                    userId: user.id
                }))
            });
        }
        
        res.json({ message: "İndirim uygulandı.", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: "Hata: " + error.message });
    }
};

const removeDiscount = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({ where: { id: id } });
        if (!product || !product.originalPrice) {
            return res.status(400).json({ error: "Ürün indirimde değil." });
        }
        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: {
                price: product.originalPrice,
                originalPrice: null,
                discountLabel: null
            }
        });
        res.json({ message: "İndirim kaldırıldı.", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: "Hata: " + error.message });
    }
};

// Tek Bir Ana Kategoriyi Getir (Başlık için)
const getProductCategoryById = async (req, res) => {
    try {
        const category = await prisma.productCategory.findUnique({
            where: { id: req.params.id },
            include: { subCategories: true } // Alt kategorilerini de gör
        });
        if (!category) return res.status(404).json({ error: 'Kategori bulunamadı.' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Hata: ' + error.message });
    }
};

// Tek Bir Alt Kategoriyi Getir (Başlık için)
const getProductSubCategoryById = async (req, res) => {
    try {
        const subCategory = await prisma.productSubCategory.findUnique({
            where: { id: req.params.id },
            include: { category: true } // Bağlı olduğu ana kategoriyi de gör
        });
        if (!subCategory) return res.status(404).json({ error: 'Alt kategori bulunamadı.' });
        res.json(subCategory);
    } catch (error) {
        res.status(500).json({ error: 'Hata: ' + error.message });
    }
};

module.exports = {
  getProductCategoryById,    
  getProductSubCategoryById, 
  createProductCategory,
  getAllProductCategories,
  updateProductCategory,
  deleteProductCategory,
  createProductSubCategory,
  updateProductSubCategory,
  deleteProductSubCategory,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  applyDiscount,
  removeDiscount
};
// src/controllers/product.controller.js
const prisma = require('../config/prisma'); // DİKKAT: Yolu ../config/prisma olarak düzeltin

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
// ÜRÜN ALT KATEGORİLERİ (Çoklu Dil)
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

// ===================================
// ÜRÜNLER (Çoklu Dil)
// ===================================

const createProduct = async (req, res) => {
  try {
    const { 
        // Çoklu dil alanları
        name_tr, name_en, 
        description_tr, description_en, 
        shortDescription_tr, shortDescription_en,
        
        // Diğer alanlar
        price, originalPrice, discountLabel, // Kampanya alanları da eklendi
        sku, stock, status, 
        subCategoryId, galleryImages 
    } = req.body;

    if (!name_tr || !description_tr || !price) {
        return res.status(400).json({ error: 'TR Ad (name_tr), TR Açıklama (description_tr) ve Fiyat (price) zorunludur.' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name_tr, name_en,
        description_tr, description_en,
        shortDescription_tr, shortDescription_en,
        price, originalPrice, discountLabel,
        sku, stock, status,
        subCategoryId,
        galleryImages: galleryImages ? {
          create: galleryImages.map(img => ({
            imageUrl: img.imageUrl,
            altText: img.altText || name_tr, // TR adı varsayılan alt text yap
            order: img.order || 0
          }))
        } : undefined
      },
      include: { galleryImages: true }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Ürün oluşturulamadı: ' + error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { subCategory } = req.query;
    const whereClause = { status: 'published' }; // Sadece yayınlananları göster
    if (subCategory) {
      whereClause.subCategoryId = subCategory;
    }
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        subCategory: { select: { name_tr: true, name_en: true } },
        galleryImages: { take: 1, orderBy: { order: 'asc' } }
      }
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
            sku, stock, status, subCategoryId 
        } = req.body;
        
        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: { 
                name_tr, name_en, 
                description_tr, description_en, 
                shortDescription_tr, shortDescription_en,
                price, originalPrice, discountLabel,
                sku, stock, status, subCategoryId
            }
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Ürün güncellenemedi: ' + error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Ürün başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Ürün silinemedi: ' + error.message });
    }
};

// ===================================
// KAMPANYA İŞLEMLERİ (Aynı kalır)
// ===================================

const applyDiscount = async (req, res) => {
    // ... (Bu fonksiyonun içeriği dilden bağımsızdır, olduğu gibi kalabilir)
    // ... (Sadece bildirim mesajını name_tr olarak güncelleyin)
    const { id } = req.params;
    const { type, value } = req.body;

    if (!type || !value || value <= 0) {
        return res.status(400).json({ error: "İndirim tipi ('percentage' veya 'fixed') ve 0'dan büyük bir değer zorunludur." });
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

        // Bildirimi TR isme göre gönder
        const users = await prisma.user.findMany({ select: { id: true } });
        const notificationData = users.map(user => ({
            title: "Yeni İndirim Fırsatı!",
            message: `${product.name_tr} ürünü şimdi ${discountLabel} ile satışta!`, // name -> name_tr
            link: `/products/${product.id}`,
            type: "indirim",
            userId: user.id
        }));

        if (notificationData.length > 0) {
            await prisma.notification.createMany({ data: notificationData });
        }
        res.json({ message: "İndirim başarıyla uygulandı.", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: "İndirim uygulanırken hata oluştu: " + error.message });
    }
};

const removeDiscount = async (req, res) => {
    // ... (Bu fonksiyon dilden bağımsızdır, olduğu gibi kalabilir)
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({ where: { id: id } });
        if (!product || !product.originalPrice) {
            return res.status(400).json({ error: "Ürün zaten indirimde değil." });
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
        res.status(500).json({ error: "İndirim kaldırılırken hata oluştu: " + error.message });
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

module.exports = {
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
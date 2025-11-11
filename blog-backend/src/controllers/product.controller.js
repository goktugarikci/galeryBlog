// src/controllers/product.controller.js
const prisma = require('../config/prisma');

// ===================================
// ÜRÜN KATEGORİLERİ (ProductCategory)
// ===================================

// POST /api/products/categories
const createProductCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.productCategory.create({ data: { name, description } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Ürün kategorisi oluşturulamadı: ' + error.message });
  }
};

// GET /api/products/categories
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

// PUT /api/products/categories/:id
const updateProductCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedCategory = await prisma.productCategory.update({
            where: { id: id },
            data: { name, description }
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: 'Ürün kategorisi güncellenemedi: ' + error.message });
    }
};

// DELETE /api/products/categories/:id
const deleteProductCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.productCategory.delete({ where: { id: id } });
        res.status(200).json({ message: 'Ürün kategorisi başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Ürün kategorisi silinemedi: ' + error.message });
    }
};

// ===================================
// ÜRÜN ALT KATEGORİLERİ (ProductSubCategory)
// ===================================

// POST /api/products/subcategories
const createProductSubCategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    const subCategory = await prisma.productSubCategory.create({
      data: { name, description, categoryId }
    });
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ error: 'Ürün alt kategorisi oluşturulamadı: ' + error.message });
  }
};

// (Diğer Ürün Alt Kategori CRUD işlemleri...)

// ===================================
// ÜRÜNLER (Product)
// ===================================

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { 
        name, description, shortDescription, price, sku, stock, status, 
        subCategoryId, galleryImages // galleryImages: [{ imageUrl: "url1", order: 1 }, ...]
    } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        shortDescription,
        price,
        sku,
        stock,
        status,
        subCategoryId,
        // İç içe (nested) create: Ürünü oluştururken galeri görsellerini de oluştur
        galleryImages: {
          create: galleryImages.map(img => ({
            imageUrl: img.imageUrl, // /api/upload'dan gelen URL
            altText: img.altText || name,
            order: img.order || 0
          }))
        }
      },
      include: {
        galleryImages: true // Oluşturulan görselleri yanıtta döndür
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Ürün oluşturulamadı: ' + error.message });
  }
};

// GET /api/products (Public)
const getAllProducts = async (req, res) => {
  try {
    const { subCategory } = req.query; // ?subCategory=id ile filtrele
    
    const whereClause = {};
    if (subCategory) {
      whereClause.subCategoryId = subCategory;
    }
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        subCategory: { select: { name: true } },
        galleryImages: { // Sadece ilk (kapak) görseli al
          take: 1,
          orderBy: { order: 'asc' }
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ürünler getirilemedi: ' + error.message });
  }
};

// GET /api/products/:id (Public)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        galleryImages: { // Tüm galeri görsellerini sırasına göre al
          orderBy: { order: 'asc' }
        },
        subCategory: { // Alt kategori ve ana kategori bilgisini al
          include: {
            category: true 
          }
        }
      }
    });
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ürün getirilemedi: ' + error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Not: Galeri güncellemesi (image silme/ekleme) daha karmaşık bir işlemdir
        // ve ayrı bir endpoint (/api/products/:id/gallery) gerektirebilir.
        // Bu temel güncelleme, ana verileri günceller.
        const { name, description, shortDescription, price, sku, stock, status, subCategoryId } = req.body;
        
        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: { name, description, shortDescription, price, sku, stock, status, subCategoryId }
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Ürün güncellenemedi: ' + error.message });
    }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Not: 'onDelete: Cascade' (schema'da) sayesinde ürün silinince
        // ilişkili 'ProductImage' ve 'CartItem' kayıtları da silinecektir.
        await prisma.product.delete({ where: { id: id } });
        res.status(200).json({ message: 'Ürün başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Ürün silinemedi: ' + error.message });
    }
};

const applyDiscount = async (req, res) => {
    const { id } = req.params; // Güncellenecek Ürün ID'si
    const { type, value } = req.body; // type: "percentage" | "fixed"
                                      // value: (e.g., 10 (10% veya 10 TL))

    if (!type || !value || value <= 0) {
        return res.status(400).json({ error: "İndirim tipi ('percentage' veya 'fixed') ve 0'dan büyük bir değer zorunludur." });
    }

    try {
        // 1. Ürünü bul (Mevcut fiyatını öğrenmek için)
        // Eğer ürün zaten indirimdeyse (originalPrice doluysa),
        // yeni indirimi *orijinal* fiyattan hesapla.
        const product = await prisma.product.findUnique({ where: { id: id } });
        if (!product) {
            return res.status(404).json({ error: "Ürün bulunamadı." });
        }

        // İndirim hesaplaması için temel alınacak fiyat
        const basePrice = product.originalPrice || product.price; 
        
        let newPrice;
        let discountLabel;

        // 2. Yeni Fiyatı ve Etiketi Hesapla
        if (type === "percentage") {
            newPrice = basePrice - (basePrice * (value / 100));
            discountLabel = `%${value} İndirim`;
        } else if (type === "fixed") {
            newPrice = basePrice - value;
            // (Opsiyonel: %'sini de hesaplayabiliriz)
            const percentOff = Math.round(((basePrice - newPrice) / basePrice) * 100);
            discountLabel = `${value} TL İndirim (%${percentOff})`;
        } else {
            return res.status(400).json({ error: "Geçersiz indirim tipi." });
        }

        if (newPrice < 0) newPrice = 0; // Fiyat negatif olamaz

        // 3. Ürünü Veritabanında Güncelle
        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: {
                price: newPrice,            // Yeni indirimli satış fiyatı
                originalPrice: basePrice,   // Eski üstü çizili fiyat
                discountLabel: discountLabel // "10% İndirim" etiketi
            }
        });

        // 4. (İSTEK) Tüm Kullanıcılara Bildirim Gönder
        // UYARI: Bu işlem, eğer 10.000+ kullanıcınız varsa sunucuyu yavaşlatabilir
        // ve bir "Kuyruk (Queue)" sistemi gerektirebilir. 
        // Ancak temel ihtiyaç için (createMany) yeterlidir.
        
        const users = await prisma.user.findMany({ select: { id: true } });
        
        const notificationData = users.map(user => ({
            title: "Yeni İndirim Fırsatı!",
            message: `${product.name} ürünü şimdi ${discountLabel} ile satışta!`,
            link: `/products/${product.id}`, // Ürüne giden link (Frontend'de)
            type: "indirim",
            userId: user.id
        }));

        if (notificationData.length > 0) {
            await prisma.notification.createMany({
                data: notificationData
            });
        }

        // 5. Başarılı Yanıt
        res.json({
            message: "İndirim başarıyla uygulandı ve bildirimler gönderildi.",
            product: updatedProduct
        });

    } catch (error) {
        res.status(500).json({ error: "İndirim uygulanırken hata oluştu: " + error.message });
    }
};

// --- İndirimi Kaldırma Fonksiyonu (Bonus) ---
const removeDiscount = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({ where: { id: id } });
        if (!product || !product.originalPrice) {
            return res.status(400).json({ error: "Ürün zaten indirimde değil." });
        }
        
        // Fiyatı orijinal fiyatına geri döndür
        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: {
                price: product.originalPrice, // Fiyatı eski haline getir
                originalPrice: null,          // Üstü çizili fiyatı temizle
                discountLabel: null           // Etiketi temizle
            }
        });
        res.json({
            message: "İndirim kaldırıldı.",
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ error: "İndirim kaldırılırken hata oluştu: " + error.message });
    }
};

module.exports = {
  createProductCategory,
  getAllProductCategories,
  updateProductCategory,
  deleteProductCategory,
  createProductSubCategory,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  applyDiscount,    // YENİ EKLEME
  removeDiscount    // YENİ EKLEME
};
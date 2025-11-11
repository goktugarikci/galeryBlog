// src/controllers/ecommerce.controller.js
// DİKKAT: Yolu ../config/prisma olarak düzelttiğinizden emin olun
const prisma = require('../config/prisma');

// ===================================
// SEPET FONKSİYONLARI
// (Not: Bu fonksiyonlar çoğunlukla ID ve stok üzerinden çalışır,
// dil güncellemesinden doğrudan etkilenmezler.)
// ===================================

// GET /api/shop/cart - Kullanıcının sepetini getir
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: {
        product: { 
            include: {
                galleryImages: { take: 1, orderBy: { order: 'asc' } }
            }
        } 
        // Product'ı tam olarak dahil ettiğimiz için (ilişkili tüm _tr/_en alanları)
        // frontend'de dil seçimi yapılabilir.
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: 'Sepet getirilemedi: ' + error.message });
  }
};

// POST /api/shop/cart - Sepete ürün ekle
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Geçerli bir ürün ID ve adet giriniz.' });
    }
    const product = await prisma.product.findUnique({ where: { id: productId }});
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı.' });
    
    const existingCartItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: userId, productId: productId } }
    });

    let newQuantity = quantity;
    if (existingCartItem) {
      newQuantity += existingCartItem.quantity;
    }
    
    if (product.stock < newQuantity) {
      return res.status(400).json({ error: 'Yetersiz stok.' });
    }

    const cartItem = await prisma.cartItem.upsert({
        where: { userId_productId: { userId: userId, productId: productId } },
        update: { quantity: newQuantity },
        create: { userId: userId, productId: productId, quantity: quantity }
    });
    
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Ürün sepete eklenemedi: ' + error.message });
  }
};

// PUT /api/shop/cart/:itemId - Sepetteki ürünün adedini değiştir
const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Adet 1 veya daha fazla olmalıdır.' });
    }
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: userId },
      include: { product: true }
    });
    if (!cartItem) {
      return res.status(404).json({ error: 'Sepet öğesi bulunamadı veya size ait değil.' });
    }
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ error: 'Yetersiz stok.' });
    }
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: quantity }
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Sepet güncellenemedi: ' + error.message });
  }
};

// DELETE /api/shop/cart/:itemId - Ürünü sepetten kaldır
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    await prisma.cartItem.deleteMany({
      where: { id: itemId, userId: userId } // Sadece kullanıcıya aitse sil
    });
    res.status(200).json({ message: 'Ürün sepetten kaldırıldı.' });
  } catch (error) {
    res.status(500).json({ error: 'Ürün sepetten kaldırılamadı: ' + error.message });
  }
};

// ===================================
// SİPARİŞ (CHECKOUT) FONKSİYONLARI (ÇOKLU DİL GÜNCELLENDİ)
// ===================================

/**
 * POST /api/shop/checkout
 * Sipariş oluşturma (Checkout) işlemi.
 */
const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { 
        paymentMethod,    // "kapida_nakit", "havale"
        shippingAddress,
        customerName,
        customerPhone,
        lang // YENİ: Frontend'in hangi dilde olduğunu al (örn: "en" veya "tr")
    } = req.body;

    if (!paymentMethod || !shippingAddress || !customerName || !customerPhone) {
        return res.status(400).json({ error: 'Ödeme yöntemi, teslimat adresi, isim ve telefon zorunludur.' });
    }

    const cartItems = await prisma.cartItem.findMany({
        where: { userId: userId },
        include: { product: true } // Ürünün anlık fiyatı, stoğu ve DİL alanları için
    });

    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Sepetiniz boş.' });
    }

    try {
        const newOrder = await prisma.$transaction(async (tx) => {
            
            let totalAmount = 0;
            const orderItemsData = [];

            for (const item of cartItems) {
                const product = item.product;
                if (product.stock < item.quantity) {
                    throw new Error(`Yetersiz stok: ${product.name_tr}`); // Hata mesajı için TR adı kullan
                }

                totalAmount += product.price * item.quantity;
                
                // === DİL GÜNCELLEMESİ ===
                // Sipariş anındaki ürün adını, kullanıcının o an seçtiği dile göre belirle
                // Eğer 'en' seçiliyse ve 'name_en' varsa onu al, yoksa 'name_tr' al.
                const productNameForOrder = (lang === 'en' && product.name_en) 
                                            ? product.name_en 
                                            : product.name_tr;
                // === GÜNCELLEME SONU ===

                orderItemsData.push({
                    productId: product.id,
                    productName: productNameForOrder, // Güncellenmiş alan
                    priceAtPurchase: product.price,
                    quantity: item.quantity
                });
            }

            const paymentStatus = (paymentMethod === 'havale') ? 'pending_confirmation' : 'unpaid';

            const order = await tx.order.create({
                data: {
                    userId: userId,
                    totalAmount: totalAmount,
                    status: 'pending',
                    paymentMethod: paymentMethod,
                    paymentStatus: paymentStatus,
                    shippingAddress: shippingAddress,
                    customerName: customerName,
                    customerPhone: customerPhone,
                    items: {
                        create: orderItemsData // OrderItem kayıtlarını oluştur
                    }
                },
                include: { items: true }
            });

            // Stokları Düş
            for (const item of cartItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Sepeti Temizle
            await tx.cartItem.deleteMany({
                where: { userId: userId }
            });

            return order;
        });

        res.status(201).json(newOrder);

    } catch (error) {
        if (error.message.startsWith('Yetersiz stok')) {
            return res.status(400).json({ error: error.message });
        }
        console.error("Checkout Hatası:", error);
        res.status(500).json({ error: 'Sipariş oluşturulurken bir hata oluştu.' });
    }
};

/**
 * GET /api/shop/orders
 * Kullanıcının kendi sipariş geçmişini getirir.
 * (Bu fonksiyon dil güncellemesinden etkilenmez, çünkü sipariş anındaki
 * (OrderItem) veriyi (productName) zaten doğru dilde kaydettik.)
 */
const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: true // Sipariş detaylarını da al
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Sipariş geçmişi getirilemedi.' });
    }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  createOrder,
  getOrderHistory
};
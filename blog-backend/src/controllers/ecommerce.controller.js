// src/controllers/ecommerce.controller.js
const prisma = require('../config/prisma');

// ===================================
// SEPET FONKSİYONLARI
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
// SİPARİŞ (CHECKOUT) FONKSİYONLARI
// ===================================

/**
 * POST /api/shop/checkout
 * Sipariş oluşturma (Checkout) işlemi.
 */
const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { 
        paymentMethod,    // "kapida_nakit", "havale", "kapida_havale"
        shippingAddress,  // "Adres bilgisi..."
        customerName,     // "Ad Soyad"
        customerPhone     // "05xxxxxxxxx"
    } = req.body;

    // 1. Girdi kontrolü
    if (!paymentMethod || !shippingAddress || !customerName || !customerPhone) {
        return res.status(400).json({ error: 'Ödeme yöntemi, teslimat adresi, isim ve telefon zorunludur.' });
    }

    // 2. Kullanıcının sepetini ve ürün detaylarını (stok/fiyat) al
    const cartItems = await prisma.cartItem.findMany({
        where: { userId: userId },
        include: { product: true } // Ürünün anlık fiyatı ve stoğu için
    });

    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Sepetiniz boş.' });
    }

    try {
        // 3. Veritabanı Transaction (Hepsi-veya-hiçbiri)
        // Sipariş oluşturulacak, stok düşülecek, sepet temizlenecek.
        const newOrder = await prisma.$transaction(async (tx) => {
            
            // 3a. Stokları kontrol et ve toplam tutarı hesapla
            let totalAmount = 0;
            const orderItemsData = []; // Sipariş öğelerini (anlık görüntü) hazırla

            for (const item of cartItems) {
                const product = item.product;
                if (product.stock < item.quantity) {
                    // Eğer stok yetersizse, transaction'ı iptal et
                    throw new Error(`Yetersiz stok: ${product.name}`);
                }

                totalAmount += product.price * item.quantity;
                
                orderItemsData.push({
                    productId: product.id,
                    productName: product.name, // O anki adı
                    priceAtPurchase: product.price, // O anki fiyatı
                    quantity: item.quantity
                });
            }

            // 3b. Ödeme durumunu belirle
            // 'havale' ise admin onayı bekler, 'kapida' ise 'unpaid'
            const paymentStatus = (paymentMethod === 'havale') 
                                    ? 'pending_confirmation' 
                                    : 'unpaid';

            // 3c. Siparişi ve ilişkili sipariş öğelerini oluştur
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    totalAmount: totalAmount,
                    status: 'pending', // Sipariş durumu (Yeni)
                    paymentMethod: paymentMethod,
                    paymentStatus: paymentStatus,
                    shippingAddress: shippingAddress,
                    customerName: customerName,
                    customerPhone: customerPhone,
                    items: {
                        create: orderItemsData // 'OrderItem' kayıtlarını oluştur
                    }
                },
                include: {
                    items: true // Oluşturulan siparişi item'larıyla döndür
                }
            });

            // 3d. Stokları Güncelle (Stoktan Düş)
            for (const item of cartItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity // Stoğu azalt
                        }
                    }
                });
            }

            // 3e. Kullanıcının sepetini temizle
            await tx.cartItem.deleteMany({
                where: { userId: userId }
            });

            return order; // Transaction başarılı, yeni siparişi döndür
        });

        // 4. Başarılı yanıt
        res.status(201).json(newOrder);

    } catch (error) {
        // 5. Hata yönetimi (Özellikle stok hatası)
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
  createOrder, // YENİ
  getOrderHistory // YENİ
};
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
    
    // Sepette zaten var mı kontrol et
    const existingCartItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: userId, productId: productId } }
    });

    let newQuantity = quantity;
    if (existingCartItem) {
      newQuantity += existingCartItem.quantity;
    }
    
    // Stok kontrolü (Sepete eklerken sadece uyarı amaçlı, gerçek düşüm siparişte)
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
      where: { id: itemId, userId: userId }
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
 * Sipariş oluşturma, stok düşme ve bildirim gönderme.
 */
const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { 
        paymentMethod,    
        shippingAddress,
        customerName,
        customerPhone,
        lang 
    } = req.body;

    if (!paymentMethod || !shippingAddress || !customerName || !customerPhone) {
        return res.status(400).json({ error: 'Ödeme yöntemi, teslimat adresi, isim ve telefon zorunludur.' });
    }

    // 1. Sepeti Getir
    const cartItems = await prisma.cartItem.findMany({
        where: { userId: userId },
        include: { product: true } 
    });

    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Sepetiniz boş.' });
    }

    try {
        // 2. Transaction Başlat (Sipariş oluştur, Stok düş, Sepeti sil)
        const newOrder = await prisma.$transaction(async (tx) => {
            
            let totalAmount = 0;
            const orderItemsData = [];

            // Stok ve Fiyat Kontrolü
            for (const item of cartItems) {
                const product = item.product;
                // Kritik: İşlem anında stok yetersizse işlemi iptal et (Race Condition koruması)
                if (product.stock < item.quantity) {
                    throw new Error(`Stok yetersiz: ${product.name_tr} (Kalan: ${product.stock})`);
                }

                totalAmount += product.price * item.quantity;
                
                // Sipariş anındaki ürün ismini dile göre kaydet
                const productNameForOrder = (lang === 'en' && product.name_en) 
                                            ? product.name_en 
                                            : product.name_tr;

                orderItemsData.push({
                    productId: product.id,
                    productName: productNameForOrder,
                    priceAtPurchase: product.price,
                    quantity: item.quantity
                });
            }

            const paymentStatus = (paymentMethod === 'havale') ? 'pending_confirmation' : 'unpaid';

            // A. Siparişi Oluştur
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
                        create: orderItemsData 
                    }
                },
                include: { items: true }
            });

            // B. Stokları Düş (Kritik Adım)
            for (const item of cartItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // C. Sepeti Temizle
            await tx.cartItem.deleteMany({
                where: { userId: userId }
            });

            return order;
        });

        // --- SOCKET VE BİLDİRİM İŞLEMLERİ (Transaction Başarılıysa) ---
        const io = req.app.get('io');
        
        // 1. Canlı Stok Güncelleme Bildirimi (Tüm kullanıcılara)
        if (io) {
            cartItems.forEach(item => {
                io.emit('product_stock_update', { productId: item.productId });
            });
            
            // 2. Admin Paneline Yeni Sipariş Bildirimi (Sesli uyarı için)
            io.to('admin_room').emit('admin_new_order', {
                id: newOrder.id,
                customerName: newOrder.customerName,
                totalAmount: newOrder.totalAmount,
                paymentMethod: newOrder.paymentMethod
            });
        }

        // 3. Adminler İçin Veritabanına Bildirim Kaydı
        const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: "Yeni Sipariş Geldi!",
                    message: `${newOrder.customerName} tarafından ${newOrder.totalAmount} TL tutarında sipariş oluşturuldu.`,
                    link: `/admin/orders`,
                    type: "order"
                }))
            });
        }
        // -----------------------------------------------------------

        res.status(201).json(newOrder);

    } catch (error) {
        if (error.message.startsWith('Stok yetersiz')) {
            return res.status(400).json({ error: error.message });
        }
        console.error("Checkout Hatası:", error);
        res.status(500).json({ error: 'Sipariş oluşturulurken bir hata oluştu.' });
    }
};

/**
 * GET /api/shop/orders
 * Kullanıcının sipariş geçmişi.
 */
const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    // Şimdi şemaya eklediğimiz 'product' ilişkisi sayesinde bu çalışacak
                    include: {
                        product: { 
                            select: {
                                galleryImages: { take: 1, orderBy: { order: 'asc' } }
                            }
                        }
                    }
                }
            }
        });
        res.json(orders);
    } catch (error) {
        console.error("Sipariş Geçmişi Hatası:", error); // Hatayı konsola yazdır
        res.status(500).json({ error: 'Sipariş geçmişi getirilemedi: ' + error.message });
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
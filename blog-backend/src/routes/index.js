// src/routes/index.js
const router = require('express').Router();

// Rota dosyalarını import et
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const ecommerceRoutes = require('./ecommerce.routes');
const uploadRoutes = require('./upload.routes');
const siteRoutes = require('./site.routes');
const blogRoutes = require('./blog.routes');
const sliderRoutes = require('./slider.routes');   // <-- YENİ İMPORT
const contactRoutes = require('./contact.routes'); // <-- YENİ İMPORT
const adminRoutes = require('./admin.routes'); // <-- YENİ İMPORT
const notificationRoutes = require('./notification.routes'); // <-- YENİ İMPORT
const pageRoutes = require('./page.routes'); // <-- YENİ İMPORT
const campaignRoutes = require('./campaign.routes')
// Rotaları prefix'leriyle kullan
router.use('/auth', authRoutes); 
router.use('/products', productRoutes);
router.use('/shop', ecommerceRoutes); 
router.use('/upload', uploadRoutes);
router.use('/settings', siteRoutes);
router.use('/blog', blogRoutes);
router.use('/slider', sliderRoutes);   // <-- YENİ EKLEME
router.use('/contact', contactRoutes); // <-- YENİ EKLEME
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes); // <-- YENİ EKLEME
router.use('/pages', pageRoutes); // <-- YENİ EKLEME ( /api/pages/... )
router.use('/api/campaigns', campaignRoutes);

module.exports = router;
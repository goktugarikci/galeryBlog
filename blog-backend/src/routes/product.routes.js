// src/routes/product.routes.js
const router = require('express').Router();
const { 
    createProductCategory, getAllProductCategories, updateProductCategory, deleteProductCategory,
    createProductSubCategory,
    createProduct, getAllProducts, getProductById, updateProduct, deleteProduct,applyDiscount,
    removeDiscount,updateProductSubCategory,deleteProductSubCategory
} = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- Ürün Kategori Rotaları ---
router.get('/categories', getAllProductCategories); // Public
router.post('/categories', verifyToken, isAdmin, createProductCategory); // Admin
router.put('/categories/:id', verifyToken, isAdmin, updateProductCategory); // Admin
router.delete('/categories/:id', verifyToken, isAdmin, deleteProductCategory); // Admin

// --- Ürün Alt Kategori Rotaları ---
router.post('/subcategories', verifyToken, isAdmin, createProductSubCategory); // Admin
// (Diğer alt kategori rotaları...)

// --- Ürün (Product) Rotaları ---
router.get('/', getAllProducts); // Public ( /api/products )
router.get('/:id', getProductById); // Public ( /api/products/123 )
router.post('/', verifyToken, isAdmin, createProduct); // Admin
router.put('/:id', verifyToken, isAdmin, updateProduct); // Admin
router.delete('/:id', verifyToken, isAdmin, deleteProduct); // Admin

/**
 * @route   POST /api/products/:id/discount
 * @desc    Bir ürüne indirim (kampanya) uygular
 * @access  Private (Admin)
 * @body    { "type": "percentage", "value": 15 }
 * @body    { "type": "fixed", "value": 50 }
 */
router.post('/:id/discount', verifyToken, isAdmin, applyDiscount);

/**
 * @route   DELETE /api/products/:id/discount
 * @desc    Bir üründeki indirimi kaldırır
 * @access  Private (Admin)
 */
router.delete('/:id/discount', verifyToken, isAdmin, removeDiscount);

router.put('/subcategories/:id', verifyToken, isAdmin, updateProductSubCategory);
router.delete('/subcategories/:id', verifyToken, isAdmin, deleteProductSubCategory);

module.exports = router;
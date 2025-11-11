// src/routes/slider.routes.js
const router = require('express').Router();
const { 
    createSlider, 
    getAllSliders, 
    updateSlider, 
    deleteSlider 
} = require('../../controllers/slider.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/slider
 * @desc    Tüm slider öğelerini getirir
 * @access  Public
 */
router.get('/', getAllSliders);

/**
 * @route   POST /api/slider
 * @desc    Yeni slider öğesi ekler
 * @access  Private (Admin)
 */
router.post('/', verifyToken, isAdmin, createSlider);

/**
 * @route   PUT /api/slider/:id
 * @desc    Slider öğesini günceller
 * @access  Private (Admin)
 */
router.put('/:id', verifyToken, isAdmin, updateSlider);

/**
 * @route   DELETE /api/slider/:id
 * @desc    Slider öğesini siler
 * @access  Private (Admin)
 */
router.delete('/:id', verifyToken, isAdmin, deleteSlider);

module.exports = router;
// blog-backend/src/routes/campaign.routes.js
const router = require('express').Router();
const { createCampaign, getAllCampaigns, getCampaignBySlug, updateCampaign, deleteCampaign,getActiveCampaigns } = require('../controllers/campaign.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public
router.get('/slug/:slug', getCampaignBySlug);

// Admin
router.get('/', verifyToken, isAdmin, getAllCampaigns);
router.post('/', verifyToken, isAdmin, createCampaign);
router.put('/:id', verifyToken, isAdmin, updateCampaign);
router.delete('/:id', verifyToken, isAdmin, deleteCampaign);
router.get('/list', getActiveCampaigns); // YENİ: /api/campaigns/list

module.exports = router;
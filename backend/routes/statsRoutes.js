const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getResistanceRatios, getHotspots, getSummary, getTrends } = require('../controllers/statsController');

router.get('/summary',    protect, getSummary);
router.get('/resistance', protect, authorize('researcher', 'admin'), getResistanceRatios);
router.get('/hotspots',   protect, authorize('researcher', 'admin'), getHotspots);
router.get('/trends',     protect, authorize('researcher', 'admin'), getTrends);

module.exports = router;

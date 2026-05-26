const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { CLSI_BREAKPOINTS } = require('../config/clsi');

// Return the list of pathogens and their associated antibiotics from CLSI reference
router.get('/', protect, (req, res) => {
  const pathogens = Object.entries(CLSI_BREAKPOINTS).map(([name, antibiotics]) => ({
    name,
    antibiotics: Object.keys(antibiotics),
  }));
  res.json({ success: true, data: pathogens });
});

module.exports = router;

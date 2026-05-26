const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSample,
  getSamples,
  getSampleById,
  updateSample,
  deleteSample,
} = require('../controllers/sampleController');

router.route('/')
  .get(protect, getSamples)
  .post(protect, createSample);

router.route('/:id')
  .get(protect, getSampleById)
  .put(protect, authorize('researcher', 'admin'), updateSample)
  .delete(protect, authorize('admin'), deleteSample);

module.exports = router;

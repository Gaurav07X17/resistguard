const Sample = require('../models/Sample');
const { classifyMIC } = require('../config/clsi');

// @desc    Submit a new culture plate / AST result
// @route   POST /api/samples
// @access  Private (technician, researcher, admin)
exports.createSample = async (req, res) => {
  try {
    const body = req.body;

    // Auto-classify any MIC values against CLSI breakpoints if result not provided
    if (body.antibiotics) {
      body.antibiotics = body.antibiotics.map(ab => {
        if (ab.mic && (!ab.result || ab.result === 'Unknown')) {
          ab.result = classifyMIC(body.pathogen, ab.name, ab.mic);
        }
        return ab;
      });
    }

    const sample = await Sample.create({ ...body, submittedBy: req.user.id });
    res.status(201).json({ success: true, data: sample });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all samples (with filters)
// @route   GET /api/samples
// @access  Private
exports.getSamples = async (req, res) => {
  try {
    const { pathogen, sampleType, hospital, ward, page = 1, limit = 20 } = req.query;

    const query = {};
    if (pathogen)    query.pathogen   = new RegExp(pathogen, 'i');
    if (sampleType)  query.sampleType = sampleType;
    if (hospital)    query['location.hospital'] = new RegExp(hospital, 'i');
    if (ward)        query['location.ward']     = new RegExp(ward, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [samples, total] = await Promise.all([
      Sample.find(query)
        .populate('submittedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Sample.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: samples.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: samples,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single sample by ID
// @route   GET /api/samples/:id
// @access  Private
exports.getSampleById = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id).populate('submittedBy', 'name role email');
    if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });
    res.json({ success: true, data: sample });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a sample
// @route   PUT /api/samples/:id
// @access  Private (admin, researcher)
exports.updateSample = async (req, res) => {
  try {
    const sample = await Sample.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });
    res.json({ success: true, data: sample });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a sample
// @route   DELETE /api/samples/:id
// @access  Private (admin only)
exports.deleteSample = async (req, res) => {
  try {
    const sample = await Sample.findByIdAndDelete(req.params.id);
    if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });
    res.json({ success: true, message: 'Sample deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Sample = require('../models/Sample');

// @desc    Get resistance ratios per pathogen (for bar/pie charts)
// @route   GET /api/stats/resistance
// @access  Private (researcher, admin)
exports.getResistanceRatios = async (req, res) => {
  try {
    const { sampleType } = req.query;
    const matchStage = sampleType ? { sampleType } : {};

    const data = await Sample.aggregate([
      { $match: matchStage },
      { $unwind: '$antibiotics' },
      {
        $group: {
          _id: {
            pathogen:   '$pathogen',
            antibiotic: '$antibiotics.name',
            result:     '$antibiotics.result',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { pathogen: '$_id.pathogen', antibiotic: '$_id.antibiotic' },
          results: { $push: { result: '$_id.result', count: '$count' } },
          total:   { $sum: '$count' },
        },
      },
      { $sort: { '_id.pathogen': 1, '_id.antibiotic': 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get hotspot data grouped by location
// @route   GET /api/stats/hotspots
// @access  Private (researcher, admin)
exports.getHotspots = async (req, res) => {
  try {
    const clinical = await Sample.aggregate([
      { $match: { sampleType: 'clinical' } },
      { $unwind: '$antibiotics' },
      { $match: { 'antibiotics.result': 'R' } },
      {
        $group: {
          _id: { hospital: '$location.hospital', ward: '$location.ward' },
          resistantCount: { $sum: 1 },
          pathogens: { $addToSet: '$pathogen' },
        },
      },
      { $sort: { resistantCount: -1 } },
    ]);

    const environmental = await Sample.aggregate([
      { $match: { sampleType: 'environmental' } },
      { $unwind: '$antibiotics' },
      { $match: { 'antibiotics.result': 'R' } },
      {
        $group: {
          _id: { site: '$location.site', city: '$location.city' },
          resistantCount: { $sum: 1 },
          pathogens: { $addToSet: '$pathogen' },
        },
      },
      { $sort: { resistantCount: -1 } },
    ]);

    res.json({ success: true, data: { clinical, environmental } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get overall summary counts
// @route   GET /api/stats/summary
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const [totalSamples, clinicalCount, environmentalCount, resistantCount] = await Promise.all([
      Sample.countDocuments(),
      Sample.countDocuments({ sampleType: 'clinical' }),
      Sample.countDocuments({ sampleType: 'environmental' }),
      Sample.aggregate([
        { $unwind: '$antibiotics' },
        { $match: { 'antibiotics.result': 'R' } },
        { $count: 'total' },
      ]),
    ]);

    // Pathogen distribution
    const pathogenDist = await Sample.aggregate([
      { $group: { _id: '$pathogen', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalSamples,
        clinicalCount,
        environmentalCount,
        totalResistantResults: resistantCount[0]?.total || 0,
        pathogenDistribution: pathogenDist,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get trend over time (monthly)
// @route   GET /api/stats/trends
// @access  Private (researcher, admin)
exports.getTrends = async (req, res) => {
  try {
    const trends = await Sample.aggregate([
      { $unwind: '$antibiotics' },
      {
        $group: {
          _id: {
            year:      { $year: '$collectedAt' },
            month:     { $month: '$collectedAt' },
            pathogen:  '$pathogen',
            result:    '$antibiotics.result',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data: trends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

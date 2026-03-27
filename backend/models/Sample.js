const mongoose = require('mongoose');

// Sub-schema for each antibiotic result on a sample
const AntibioticResultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mic: {
    // Minimum Inhibitory Concentration (µg/mL)
    type: Number,
    default: null,
  },
  diskDiffusion: {
    // Zone of inhibition in mm
    type: Number,
    default: null,
  },
  result: {
    type: String,
    enum: ['S', 'I', 'R', 'Unknown'],
    required: true,
  },
}, { _id: false });

const SampleSchema = new mongoose.Schema({
  // Core identification
  sampleId: {
    type: String,
    unique: true,
    default: () => `RG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  },

  // Microbiology
  pathogen: {
    type: String,
    required: [true, 'Pathogen name is required'],
    trim: true,
    // e.g. "E. coli", "S. aureus", "K. pneumoniae"
  },
  gramStain: {
    type: String,
    enum: ['Positive', 'Negative', 'Unknown'],
    default: 'Unknown',
  },

  // Sample origin
  sampleType: {
    type: String,
    enum: ['clinical', 'environmental'],
    required: true,
  },

  // Location — flexible for both clinical wards and environmental sites
  location: {
    // Clinical fields
    hospital:    { type: String, default: '' },
    ward:        { type: String, default: '' },
    // Environmental fields
    site:        { type: String, default: '' },
    city:        { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },

  // The AST results — array of antibiotic tests
  antibiotics: {
    type: [AntibioticResultSchema],
    validate: {
      validator: v => v.length > 0,
      message: 'At least one antibiotic result is required',
    },
  },

  // Patient / source metadata (anonymized)
  patientAge:    { type: Number, default: null },
  patientGender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },

  // Workflow
  collectedAt: { type: Date, default: Date.now },
  notes:       { type: String, default: '' },

  // Who submitted this
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    default: null,
  },

}, { timestamps: true });

// Index for fast dashboard queries
SampleSchema.index({ pathogen: 1 });
SampleSchema.index({ sampleType: 1 });
SampleSchema.index({ 'location.hospital': 1 });
SampleSchema.index({ collectedAt: -1 });

module.exports = mongoose.model('Sample', SampleSchema);

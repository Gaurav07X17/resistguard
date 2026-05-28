const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User    = require('../models/User');
const Sample  = require('../models/Sample');
const connectDB = require('./db');

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

const seed = async () => {
  await connectDB();
  await User.deleteMany();
  await Sample.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
  const [researcher, technician] = await User.insertMany([
    { name: 'Dr. Priya Sharma', email: 'researcher@demo.com', password: hashedPassword, role: 'researcher', institution: 'AIIMS Delhi' },
    { name: 'Ravi Kumar',       email: 'technician@demo.com', password: hashedPassword, role: 'technician', institution: 'Safdarjung Hospital' },
  ]);
  const rid = researcher._id;
  const tid = technician._id;

  const samples = [
    // ── E. coli (5 samples) ──────────────────────────────────────────
    { pathogen: 'E. coli', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'AIIMS Delhi', ward: 'ICU' },
      antibiotics: [{ name: 'Ampicillin', mic: 64, result: 'R' }, { name: 'Ciprofloxacin', mic: 8, result: 'R' }, { name: 'Ceftriaxone', mic: 16, result: 'R' }, { name: 'Meropenem', mic: 0.25, result: 'S' }, { name: 'Amikacin', mic: 4, result: 'S' }],
      patientAge: 54, patientGender: 'Male', collectedAt: daysAgo(2), submittedBy: tid,
      notes: 'ESBL-producing strain suspected. Repeat culture ordered.' },

    { pathogen: 'E. coli', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'AIIMS Delhi', ward: 'General Ward' },
      antibiotics: [{ name: 'Ampicillin', mic: 128, result: 'R' }, { name: 'Ciprofloxacin', mic: 1, result: 'S' }, { name: 'Ceftriaxone', mic: 2, result: 'S' }, { name: 'Trimethoprim-SMX', mic: 8, result: 'R' }, { name: 'Nitrofurantoin', mic: 16, result: 'S' }],
      patientAge: 32, patientGender: 'Female', collectedAt: daysAgo(5), submittedBy: tid },

    { pathogen: 'E. coli', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'Safdarjung Hospital', ward: 'Urology' },
      antibiotics: [{ name: 'Ampicillin', mic: 32, result: 'R' }, { name: 'Ciprofloxacin', mic: 4, result: 'I' }, { name: 'Ceftriaxone', mic: 4, result: 'I' }, { name: 'Meropenem', mic: 0.5, result: 'S' }, { name: 'Fosfomycin', mic: 8, result: 'S' }],
      patientAge: 67, patientGender: 'Male', collectedAt: daysAgo(10), submittedBy: tid },

    { pathogen: 'E. coli', gramStain: 'Negative', sampleType: 'environmental',
      location: { site: 'Yamuna River Bank', city: 'Delhi' },
      antibiotics: [{ name: 'Ampicillin', mic: 256, result: 'R' }, { name: 'Ciprofloxacin', mic: 16, result: 'R' }, { name: 'Trimethoprim-SMX', mic: 32, result: 'R' }, { name: 'Tetracycline', mic: 32, result: 'R' }, { name: 'Chloramphenicol', mic: 16, result: 'R' }],
      collectedAt: daysAgo(8), submittedBy: rid,
      notes: 'High MDR load near hospital effluent discharge point.' },

    { pathogen: 'E. coli', gramStain: 'Negative', sampleType: 'environmental',
      location: { site: 'Hospital Wastewater Outlet', city: 'Delhi' },
      antibiotics: [{ name: 'Ampicillin', mic: 128, result: 'R' }, { name: 'Ciprofloxacin', mic: 8, result: 'R' }, { name: 'Meropenem', mic: 2, result: 'I' }, { name: 'Amikacin', mic: 8, result: 'S' }],
      collectedAt: daysAgo(14), submittedBy: rid },

    // ── S. aureus (5 samples) ────────────────────────────────────────
    { pathogen: 'S. aureus', gramStain: 'Positive', sampleType: 'clinical',
      location: { hospital: 'AIIMS Delhi', ward: 'Surgery Ward' },
      antibiotics: [{ name: 'Oxacillin', mic: 8, result: 'R' }, { name: 'Vancomycin', mic: 1, result: 'S' }, { name: 'Clindamycin', mic: 0.25, result: 'S' }, { name: 'Erythromycin', mic: 4, result: 'R' }, { name: 'Linezolid', mic: 2, result: 'S' }],
      patientAge: 45, patientGender: 'Male', collectedAt: daysAgo(3), submittedBy: tid,
      notes: 'MRSA confirmed. Contact precautions initiated.' },

    { pathogen: 'S. aureus', gramStain: 'Positive', sampleType: 'clinical',
      location: { hospital: 'AIIMS Delhi', ward: 'Burns Unit' },
      antibiotics: [{ name: 'Oxacillin', mic: 16, result: 'R' }, { name: 'Vancomycin', mic: 2, result: 'S' }, { name: 'Clindamycin', mic: 8, result: 'R' }, { name: 'Tetracycline', mic: 4, result: 'I' }, { name: 'Rifampicin', mic: 0.5, result: 'S' }],
      patientAge: 28, patientGender: 'Male', collectedAt: daysAgo(6), submittedBy: tid },

    { pathogen: 'S. aureus', gramStain: 'Positive', sampleType: 'clinical',
      location: { hospital: 'Ram Manohar Lohia Hospital', ward: 'Dermatology' },
      antibiotics: [{ name: 'Oxacillin', mic: 1, result: 'S' }, { name: 'Erythromycin', mic: 1, result: 'R' }, { name: 'Clindamycin', mic: 0.5, result: 'S' }, { name: 'Tetracycline', mic: 2, result: 'S' }],
      patientAge: 19, patientGender: 'Female', collectedAt: daysAgo(12), submittedBy: tid },

    { pathogen: 'S. aureus', gramStain: 'Positive', sampleType: 'clinical',
      location: { hospital: 'Safdarjung Hospital', ward: 'ICU' },
      antibiotics: [{ name: 'Oxacillin', mic: 32, result: 'R' }, { name: 'Vancomycin', mic: 1, result: 'S' }, { name: 'Linezolid', mic: 2, result: 'S' }, { name: 'Daptomycin', mic: 0.5, result: 'S' }, { name: 'Tigecycline', mic: 0.25, result: 'S' }],
      patientAge: 72, patientGender: 'Female', collectedAt: daysAgo(1), submittedBy: tid,
      notes: 'MRSA bacteremia. Blood culture positive x2.' },

    { pathogen: 'S. aureus', gramStain: 'Positive', sampleType: 'environmental',
      location: { site: 'OT Air Sample', city: 'Delhi' },
      antibiotics: [{ name: 'Oxacillin', mic: 4, result: 'R' }, { name: 'Erythromycin', mic: 8, result: 'R' }, { name: 'Tetracycline', mic: 16, result: 'R' }],
      collectedAt: daysAgo(20), submittedBy: rid,
      notes: 'Environmental surveillance of operating theatre air quality.' },

    // ── K. pneumoniae (4 samples) ────────────────────────────────────
    { pathogen: 'K. pneumoniae', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'AIIMS Delhi', ward: 'NICU' },
      antibiotics: [{ name: 'Meropenem', mic: 16, result: 'R' }, { name: 'Imipenem', mic: 8, result: 'R' }, { name: 'Ceftazidime', mic: 64, result: 'R' }, { name: 'Colistin', mic: 1, result: 'S' }, { name: 'Tigecycline', mic: 2, result: 'I' }],
      patientAge: 0, patientGender: 'Male', collectedAt: daysAgo(4), submittedBy: tid,
      notes: 'CRKP. Outbreak investigation initiated.' },

    { pathogen: 'K. pneumoniae', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'Safdarjung Hospital', ward: 'ICU' },
      antibiotics: [{ name: 'Meropenem', mic: 4, result: 'I' }, { name: 'Ceftazidime', mic: 32, result: 'R' }, { name: 'Amikacin', mic: 8, result: 'S' }, { name: 'Ciprofloxacin', mic: 8, result: 'R' }],
      patientAge: 61, patientGender: 'Male', collectedAt: daysAgo(9), submittedBy: tid },

    { pathogen: 'K. pneumoniae', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'Ram Manohar Lohia Hospital', ward: 'Medicine Ward' },
      antibiotics: [{ name: 'Meropenem', mic: 0.5, result: 'S' }, { name: 'Ceftriaxone', mic: 1, result: 'S' }, { name: 'Amikacin', mic: 4, result: 'S' }, { name: 'Ciprofloxacin', mic: 0.5, result: 'S' }],
      patientAge: 38, patientGender: 'Female', collectedAt: daysAgo(15), submittedBy: tid },

    { pathogen: 'K. pneumoniae', gramStain: 'Negative', sampleType: 'environmental',
      location: { site: 'Hospital Drain', city: 'Delhi' },
      antibiotics: [{ name: 'Meropenem', mic: 8, result: 'R' }, { name: 'Ceftazidime', mic: 128, result: 'R' }, { name: 'Colistin', mic: 2, result: 'S' }, { name: 'Amikacin', mic: 32, result: 'R' }],
      collectedAt: daysAgo(11), submittedBy: rid },

    // ── A. baumannii (3 samples) ─────────────────────────────────────
    { pathogen: 'A. baumannii', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'AIIMS Delhi', ward: 'ICU' },
      antibiotics: [{ name: 'Meropenem', mic: 32, result: 'R' }, { name: 'Imipenem', mic: 16, result: 'R' }, { name: 'Colistin', mic: 1, result: 'S' }, { name: 'Tigecycline', mic: 4, result: 'I' }, { name: 'Ampicillin-Sulbactam', mic: 32, result: 'R' }],
      patientAge: 58, patientGender: 'Male', collectedAt: daysAgo(3), submittedBy: tid,
      notes: 'CRAB. ICU cluster under investigation.' },

    { pathogen: 'A. baumannii', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'Safdarjung Hospital', ward: 'Trauma ICU' },
      antibiotics: [{ name: 'Meropenem', mic: 64, result: 'R' }, { name: 'Colistin', mic: 2, result: 'S' }, { name: 'Rifampicin', mic: 4, result: 'I' }, { name: 'Tigecycline', mic: 2, result: 'I' }],
      patientAge: 25, patientGender: 'Male', collectedAt: daysAgo(7), submittedBy: tid },

    { pathogen: 'A. baumannii', gramStain: 'Negative', sampleType: 'environmental',
      location: { site: 'ICU Surface Swab', city: 'Delhi' },
      antibiotics: [{ name: 'Meropenem', mic: 16, result: 'R' }, { name: 'Colistin', mic: 1, result: 'S' }, { name: 'Chloramphenicol', mic: 16, result: 'R' }],
      collectedAt: daysAgo(18), submittedBy: rid,
      notes: 'Environmental sampling during ICU outbreak investigation.' },

    // ── P. aeruginosa (3 samples) ────────────────────────────────────
    { pathogen: 'P. aeruginosa', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'AIIMS Delhi', ward: 'Pulmonology' },
      antibiotics: [{ name: 'Piperacillin-Tazobactam', mic: 64, result: 'R' }, { name: 'Ceftazidime', mic: 16, result: 'R' }, { name: 'Meropenem', mic: 4, result: 'I' }, { name: 'Amikacin', mic: 8, result: 'S' }, { name: 'Colistin', mic: 1, result: 'S' }],
      patientAge: 43, patientGender: 'Female', collectedAt: daysAgo(5), submittedBy: tid,
      notes: 'Chronic lung infection in CF patient.' },

    { pathogen: 'P. aeruginosa', gramStain: 'Negative', sampleType: 'clinical',
      location: { hospital: 'Ram Manohar Lohia Hospital', ward: 'Burns Unit' },
      antibiotics: [{ name: 'Piperacillin-Tazobactam', mic: 16, result: 'I' }, { name: 'Ciprofloxacin', mic: 2, result: 'S' }, { name: 'Meropenem', mic: 1, result: 'S' }, { name: 'Amikacin', mic: 4, result: 'S' }],
      patientAge: 35, patientGender: 'Male', collectedAt: daysAgo(13), submittedBy: tid },

    { pathogen: 'P. aeruginosa', gramStain: 'Negative', sampleType: 'environmental',
      location: { site: 'Swimming Pool Water', city: 'Dehradun' },
      antibiotics: [{ name: 'Ciprofloxacin', mic: 4, result: 'R' }, { name: 'Ceftazidime', mic: 8, result: 'R' }, { name: 'Meropenem', mic: 2, result: 'I' }, { name: 'Amikacin', mic: 16, result: 'R' }],
      collectedAt: daysAgo(22), submittedBy: rid },

    // ── E. faecium (3 samples) ───────────────────────────────────────
    { pathogen: 'E. faecium', gramStain: 'Positive', sampleType: 'clinical',
      location: { hospital: 'AIIMS Delhi', ward: 'Haematology' },
      antibiotics: [{ name: 'Vancomycin', mic: 32, result: 'R' }, { name: 'Ampicillin', mic: 64, result: 'R' }, { name: 'Linezolid', mic: 2, result: 'S' }, { name: 'Daptomycin', mic: 1, result: 'S' }, { name: 'Tigecycline', mic: 0.12, result: 'S' }],
      patientAge: 51, patientGender: 'Female', collectedAt: daysAgo(2), submittedBy: tid,
      notes: 'VRE. Haem-oncology patient post-transplant.' },

    { pathogen: 'E. faecium', gramStain: 'Positive', sampleType: 'clinical',
      location: { hospital: 'Safdarjung Hospital', ward: 'Medicine Ward' },
      antibiotics: [{ name: 'Vancomycin', mic: 4, result: 'I' }, { name: 'Ampicillin', mic: 16, result: 'R' }, { name: 'Linezolid', mic: 2, result: 'S' }, { name: 'Tetracycline', mic: 8, result: 'R' }],
      patientAge: 64, patientGender: 'Male', collectedAt: daysAgo(17), submittedBy: tid },

    { pathogen: 'E. faecium', gramStain: 'Positive', sampleType: 'environmental',
      location: { site: 'Poultry Farm Water', city: 'Haridwar' },
      antibiotics: [{ name: 'Vancomycin', mic: 64, result: 'R' }, { name: 'Ampicillin', mic: 128, result: 'R' }, { name: 'Erythromycin', mic: 32, result: 'R' }, { name: 'Chloramphenicol', mic: 8, result: 'I' }],
      collectedAt: daysAgo(25), submittedBy: rid,
      notes: 'One Health surveillance. VRE in agricultural water source.' },
  ];

  await Sample.insertMany(samples);

  console.log(`✅ Seeded ${samples.length} samples across 5 pathogens!`);
  console.log('👤 Researcher: researcher@demo.com / password123');
  console.log('👤 Technician: technician@demo.com / password123');
  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config({ path: '../.env' });
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Sample = require('../models/Sample');

const connectDB = require('./db');

const seed = async () => {
  await connectDB();

  await User.deleteMany();
  await Sample.deleteMany();

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  await User.insertMany([
    { name: 'Dr. Priya Sharma', email: 'researcher@demo.com', password: hashedPassword, role: 'researcher' },
    { name: 'Tech Ravi Kumar',  email: 'technician@demo.com', password: hashedPassword, role: 'technician' },
  ]);

  // Create demo samples
  const samples = [
    { pathogen: 'E. coli',       sampleType: 'clinical',     location: { ward: 'ICU',           hospital: 'AIIMS Delhi' },     antibiotics: [{ name: 'Ampicillin', mic: 64, result: 'R' }, { name: 'Ciprofloxacin', mic: 0.5, result: 'S' }, { name: 'Ceftriaxone', mic: 8, result: 'R' }] },
    { pathogen: 'S. aureus',     sampleType: 'clinical',     location: { ward: 'Surgery Ward',  hospital: 'AIIMS Delhi' },     antibiotics: [{ name: 'Oxacillin',  mic: 8,  result: 'R' }, { name: 'Vancomycin',    mic: 1,  result: 'S' }, { name: 'Clindamycin', mic: 0.25, result: 'S' }] },
    { pathogen: 'K. pneumoniae', sampleType: 'clinical',     location: { ward: 'NICU',          hospital: 'Safdarjung Delhi' },antibiotics: [{ name: 'Meropenem',  mic: 8,  result: 'R' }, { name: 'Amikacin',      mic: 16, result: 'S' }, { name: 'Ceftazidime', mic: 32, result: 'R' }] },
    { pathogen: 'E. coli',       sampleType: 'environmental',location: { site: 'Yamuna River',  city: 'Delhi' },               antibiotics: [{ name: 'Ampicillin', mic: 128,result: 'R' }, { name: 'Ciprofloxacin', mic: 8,  result: 'R' }, { name: 'Trimethoprim-SMX', mic: 16, result: 'R' }] },
    { pathogen: 'S. aureus',     sampleType: 'clinical',     location: { ward: 'General Ward',  hospital: 'AIIMS Delhi' },     antibiotics: [{ name: 'Oxacillin',  mic: 1,  result: 'S' }, { name: 'Erythromycin',  mic: 1,  result: 'R' }, { name: 'Tetracycline', mic: 8, result: 'I' }] },
    { pathogen: 'K. pneumoniae', sampleType: 'environmental',location: { site: 'Hospital Drain',city: 'Delhi' },               antibiotics: [{ name: 'Meropenem',  mic: 2,  result: 'I' }, { name: 'Imipenem',      mic: 4,  result: 'R' }, { name: 'Amikacin', mic: 64, result: 'R' }] },
  ];

  await Sample.insertMany(samples);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Researcher login: researcher@demo.com / password123');
  console.log('👤 Technician login: technician@demo.com / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

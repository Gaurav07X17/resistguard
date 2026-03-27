const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,          // e.g. https://resistguard.vercel.app
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/samples', require('./routes/sampleRoutes'));
app.use('/api/stats',   require('./routes/statsRoutes'));
app.use('/api/pathogens', require('./routes/pathogenRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ResistGuard API is running', version: '1.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🛡️  ResistGuard server running on port ${PORT}`));

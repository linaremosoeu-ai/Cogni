import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Import routes
import documentRoutes from './src/routes/documentRoutes.js';
import studyVaultRoutes from './src/routes/studyVaultRoutes.js';
import conceptMapRoutes from './src/routes/conceptMapRoutes.js';
import flashcardRoutes from './src/routes/flashcardRoutes.js';
import quizRoutes from './src/routes/quizRoutes.js';
import tutorRoutes from './src/routes/tutorRoutes.js';
import apiPlaygroundRoutes from './src/routes/apiPlaygroundRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(compression());

// CORS Configuration (IMPORTANT: Must be before other middleware)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://cogni.app'
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging Middleware
app.use(morgan('combined'));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/study-vaults', express.static(path.join(__dirname, 'study-vaults')));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/study-vault', studyVaultRoutes);
app.use('/api/concept-map', conceptMapRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/api-playground', apiPlaygroundRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      status: 404,
      message: 'Route not found'
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Cogni Server running on http://localhost:${PORT}`);
  console.log(`📚 Study Engine Active`);
  console.log(`🤖 Gemini AI Integration: ${process.env.GEMINI_API_KEY ? 'Connected ✓' : 'Disconnected ✗'}`);
  console.log(`\n📝 Test Credentials:`);
  console.log(`   Email: test@cogni.ai`);
  console.log(`   Password: 123456Aa\n`);
});

export default app;
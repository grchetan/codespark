import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initDb } from './db';
import authRoutes from './routes/auth';
import effectsRoutes from './routes/effects';
import adminRoutes from './routes/admin';
import newsletterRoutes from './routes/newsletter';
import contactRoutes from './routes/contact';
import systemRoutes from './routes/system';

dotenv.config();

// ── Fail-fast: refuse to start without a strong JWT secret ──────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET environment variable is missing or too short (must be ≥32 chars). Server cannot start.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ── Allowed origins (comma-separated in env) ─────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Always allow localhost in development
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000');
}

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // SPA handles its own CSP via meta tag / Vercel headers
    crossOriginEmbedderPolicy: false,
  })
);
app.disable('x-powered-by');

// ── CORS — whitelist only trusted origins ────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      // In dev mode with no origins configured, allow all
      if (ALLOWED_ORIGINS.length === 0) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsing — tighter size limits ───────────────────────────────────────
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

// ── Global rate limit — 200 req / 15 min per IP ──────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please try again later.' },
  })
);

// ── Initialize SQLite database & seed initial data ───────────────────────────
initDb();

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/effects', effectsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/system', systemRoutes);

// ── Health check (generic — no internal details) ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ── Global error handler — never leak internal error details ─────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log full error server-side for debugging
  console.error(`[${new Date().toISOString()}] Server Error on ${req.method} ${req.path}:`, err);
  // Return safe generic message to client
  res.status(err.status || 500).json({ success: false, error: 'An unexpected error occurred. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`🚀 CodeSpark API Server listening on port ${PORT}`);
  // Never log credentials — use your .env / secrets manager
});

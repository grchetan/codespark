import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import authRoutes from './routes/auth';
import effectsRoutes from './routes/effects';
import adminRoutes from './routes/admin';
import newsletterRoutes from './routes/newsletter';
import contactRoutes from './routes/contact';
import systemRoutes from './routes/system';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite database & seed initial data
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/effects', effectsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/system', systemRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'CodeSpark Backend' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CodeSpark API Server listening on http://localhost:${PORT}`);
  console.log(`🛡️  Admin Account: admin@codespark.dev / Admin@123`);
});

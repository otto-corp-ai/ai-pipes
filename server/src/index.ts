import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import workflowRoutes from './routes/workflows';
import apiKeyRoutes from './routes/api-keys';
import billingRoutes from './routes/billing';
import modelRoutes from './routes/models';
import { loadScheduledWorkflows } from './lib/scheduler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Raw body for Stripe webhooks
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/models', modelRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AI Pipes server running on port ${PORT}`);
  loadScheduledWorkflows();
});

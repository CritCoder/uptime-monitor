import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import { fileURLToPath } from 'url';
import path from 'path';
// import { createBullBoard } from '@bull-board/api';
// import { BullAdapter } from '@bull-board/api/bullAdapter';
// import { ExpressAdapter } from '@bull-board/express';

// Import routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import monitorRoutes from './routes/monitors.js';
import incidentRoutes from './routes/incidents.js';
import alertRoutes from './routes/alerts.js';
import statusPageRoutes from './routes/statusPages.js';
import webhookRoutes from './routes/webhooks.js';
import workspaceRoutes from './routes/workspaces.js';
import adminRoutes from './routes/admin.js';
import missingRoutes from './routes/missing.js';
import subscriptionRoutes from './routes/subscription.js';
import integrationsRoutes from './routes/integrations.js';

// Import services
import { initializeQueues } from './services/queue.js';
import { initializeSocket } from './services/socket.js';
import { startMonitorScheduler } from './services/scheduler.js';
import { verifyEmailConfig } from './services/email.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Bull Board for queue monitoring (disabled for now)
// const serverAdapter = new ExpressAdapter();
// serverAdapter.setBasePath('/admin/queues');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Webhooks route (must be before express.json middleware for raw body)
app.use('/webhooks', webhookRoutes);

// JSON body parser (after webhooks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (screenshots)
app.use('/screenshots', express.static(path.join(__dirname, 'public/screenshots')));

// Initialize Passport
app.use(passport.initialize());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Uptime Monitor API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      monitors: '/api/monitors',
      incidents: '/api/incidents',
      alerts: '/api/alerts',
      statusPages: '/api/status-pages',
      subscription: '/api/subscription',
      publicStatus: '/status/public/:slug'
    },
    documentation: 'https://github.com/your-repo/uptime-monitor'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/status-pages', statusPageRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', missingRoutes);

// Public status page routes
app.use('/status', statusPageRoutes);

// Bull Board for queue monitoring (disabled for now)
// createBullBoard({
//   queues: [], // Will be populated after queues are initialized
//   serverAdapter: serverAdapter,
// });
// app.use('/admin/queues', serverAdapter.getRouter());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services
async function initializeApp() {
  try {
    // Verify email configuration
    await verifyEmailConfig();

    // Initialize queues
    const queues = await initializeQueues();

    // Update Bull Board with queues (disabled for now)
    // const bullAdapters = queues.map(queue => new BullAdapter(queue));
    // createBullBoard({
    //   queues: bullAdapters,
    //   serverAdapter: serverAdapter,
    // });
    
    // Initialize Socket.io
    initializeSocket(io);
    
    // Start monitor scheduler
    startMonitorScheduler(queues);
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Queue dashboard: http://localhost:${PORT}/admin/queues`);
  await initializeApp();
});

export default app;

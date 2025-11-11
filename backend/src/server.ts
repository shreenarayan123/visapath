import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  // reference req to avoid "declared but never read" TS6133 when running ts-node
  void req;
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  // reference req to avoid "declared but never read" TS6133 when running ts-node
  void req;
  res.status(404).json({
    success: false,
    error: {
      statusCode: 404,
      message: 'Route not found'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📝 API Documentation: http://localhost:${PORT}/api`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;

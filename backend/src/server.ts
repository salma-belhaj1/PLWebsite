import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { initializeDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import healthRouter from './routes/health.js';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';

const app: Express = express();

// Middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || /localhost|127\.0\.0\.1/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, origin === config.corsOrigin);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    const dbConnected = await initializeDatabase();
    
    if (!dbConnected) {
      console.warn('⚠️ Warning: Database not connected');
      if (config.nodeEnv === 'production') {
        throw new Error('Failed to connect to database in production');
      }
      console.warn('⚠️ Running in development mode without database');
    }

    app.listen(config.port, () => {
      console.log(`✅ Server running on http://localhost:${config.port}`);
      console.log(`📦 Environment: ${config.nodeEnv}`);
      if (dbConnected) {
        console.log('🗄️ Database: Connected');
      } else {
        console.log('🗄️ Database: Not connected');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

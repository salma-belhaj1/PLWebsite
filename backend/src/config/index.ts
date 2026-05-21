import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost/peace_love_db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production');
}

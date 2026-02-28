import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  databaseUrl: process.env.DATABASE_URL || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  appUrl: process.env.APP_URL || 'http://localhost:5173',

  isDev() {
    return this.nodeEnv === 'development';
  },
};

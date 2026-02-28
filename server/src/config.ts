import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  databaseUrl: process.env.DATABASE_URL || '',
  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  appUrl: process.env.APP_URL || 'http://localhost:5173',

  isDev() {
    return this.nodeEnv === 'development';
  },
};

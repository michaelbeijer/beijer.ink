import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import notebooksRoutes from './routes/notebooks.routes.js';
import notesRoutes from './routes/notes.routes.js';
import tagsRoutes from './routes/tags.routes.js';
import searchRoutes from './routes/search.routes.js';
import imagesRoutes from './routes/images.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/notebooks', requireAuth, notebooksRoutes);
  app.use('/api/notes', requireAuth, notesRoutes);
  app.use('/api/tags', requireAuth, tagsRoutes);
  app.use('/api/search', requireAuth, searchRoutes);
  app.use('/api/images', requireAuth, imagesRoutes);

  // Serve static frontend in production
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  // Error handler
  app.use(errorHandler);

  return app;
}

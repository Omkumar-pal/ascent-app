import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import authRoutes from './modules/auth/authRoutes';
import goalsRoutes from './modules/goals/goalsRoutes';
import milestonesRoutes from './modules/milestones/milestonesRoutes';
import actionsRoutes from './modules/actions/actionsRoutes';
import routinesRoutes from './modules/routines/routinesRoutes';
import reflectionsRoutes from './modules/reflections/reflectionsRoutes';
import dashboardRoutes from './modules/dashboard/dashboardRoutes';
import profileRoutes from './modules/profile/profileRoutes';

const app = express();

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// API Route Registry
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/goals', goalsRoutes);
app.use('/api/v1/milestones', milestonesRoutes);
app.use('/api/v1/actions', actionsRoutes);
app.use('/api/v1/routines', routinesRoutes);
app.use('/api/v1/reflections', reflectionsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/profile', profileRoutes);

// Health check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'Ascent API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Ascent Backend API running on http://localhost:${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/api/v1/health`);
});

import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import potholeRoutes from './routes/potholeRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/health', healthRoutes);
app.use('/api/v1/potholes', potholeRoutes);
app.use('/api/v1/routes', routeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`AI Road Guardian backend running on port ${env.port}`, { env: env.nodeEnv });
});

export default app;

import { Router } from 'express';
import { fetchRoutes } from '../controllers/routeController.js';

const router = Router();

// GET /api/v1/routes?fromLat=&fromLng=&toLat=&toLng=
router.get('/', fetchRoutes);

export default router;

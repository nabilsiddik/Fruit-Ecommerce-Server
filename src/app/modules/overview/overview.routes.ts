import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth.js';
import { OverviewController } from './overview.controller.js';

const router = Router();

router.get(
    '/',
    checkAuth('ADMIN', 'SUPER_ADMIN'),
    OverviewController.getDashboardData
);

export const OverviewRoutes = router;

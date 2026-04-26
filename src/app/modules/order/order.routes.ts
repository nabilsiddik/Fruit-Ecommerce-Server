import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { checkAuth } from '../../middleware/checkAuth.js';

const router = Router();

router.post(
    '/',
    checkAuth('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
    OrderController.createOrder
);

router.get(
    '/my-orders',
    checkAuth('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
    OrderController.getMyOrders
);

export const OrderRoutes = router;

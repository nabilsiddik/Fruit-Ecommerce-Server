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

router.get(
    '/all-orders',
    checkAuth('ADMIN', 'SUPER_ADMIN'),
    OrderController.getAllOrders
);

router.get(
    '/:id',
    checkAuth('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
    OrderController.getOrderById
);

router.patch(
    '/update-status/:id',
    checkAuth('ADMIN', 'SUPER_ADMIN', 'VENDOR'),
    OrderController.updateOrderStatus
);

export const OrderRoutes = router;

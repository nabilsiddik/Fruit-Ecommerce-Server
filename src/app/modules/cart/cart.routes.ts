import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { checkAuth } from '../../middleware/checkAuth.js';

const router = Router();

router.get(
    '/',
    checkAuth('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
    CartController.getCart
);

router.post(
    '/add',
    checkAuth('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
    CartController.addToCart
);

router.patch(
    '/update/:itemId',
    checkAuth('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
    CartController.updateCartQuantity
);

router.delete(
    '/remove/:itemId',
    checkAuth('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
    CartController.removeFromCart
);

router.delete(
    '/clear',
    checkAuth('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'),
    CartController.clearCart
);

export const CartRoutes = router;

import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth.js';
import { UserController } from './user.controller.js';

const router = Router();

router.get(
    '/all-customers',
    checkAuth('ADMIN', 'SUPER_ADMIN'),
    UserController.getAllCustomers
);

router.get(
    '/customer/:id',
    checkAuth('ADMIN', 'SUPER_ADMIN'),
    UserController.getCustomerById
);

router.get(
    '/my-profile',
    checkAuth('ADMIN', 'VENDOR', 'USER', 'SUPER_ADMIN'),
    UserController.getMyProfile
);

router.patch(
    '/update-profile',
    checkAuth('ADMIN', 'VENDOR', 'USER', 'SUPER_ADMIN'),
    UserController.updateProfile
);

export const UserRoutes = router;

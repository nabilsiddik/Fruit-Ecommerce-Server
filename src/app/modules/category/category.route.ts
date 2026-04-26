import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import { checkAuth } from '../../middleware/checkAuth.js';

const router = Router();

router.get('/', CategoryController.getAllCategories);

router.post(
    '/',
    checkAuth('ADMIN', 'SUPER_ADMIN'),
    CategoryController.createCategory
);

export const CategoryRoutes = router;

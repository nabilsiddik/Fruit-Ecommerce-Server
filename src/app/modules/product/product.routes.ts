import { Router } from 'express';
import { ProductValidation } from './product.validation.js';
import { ProductController } from './product.controller.js';
import { checkAuth } from '../../middleware/checkAuth.js';
import validateRequest from '../../middleware/validateRequest.js';

const router = Router();

router.get('/', ProductController.getAllProducts);

router.post(
    '/',
    checkAuth('ADMIN', 'VENDOR', 'SUPER_ADMIN'),
    validateRequest(ProductValidation.createProductValidationSchema),
    ProductController.createProduct
);

export const ProductRoutes = router;

import { Router } from 'express';
import { ProductValidation } from './product.validation.js';
import { ProductController } from './product.controller.js';
import { checkAuth } from '../../middleware/checkAuth.js';
import validateRequest from '../../middleware/validateRequest.js';

const router = Router();

router.get('/', ProductController.getAllProducts);

router.get('/:id', ProductController.getProductById);

router.post(
    '/',
    checkAuth('ADMIN', 'VENDOR', 'SUPER_ADMIN'),
    validateRequest(ProductValidation.createProductValidationSchema),
    ProductController.createProduct
);

router.patch(
    '/:id',
    checkAuth('ADMIN', 'VENDOR', 'SUPER_ADMIN'),
    validateRequest(ProductValidation.updateProductValidationSchema),
    ProductController.updateProduct
);

router.delete(
    '/:id',
    checkAuth('ADMIN', 'VENDOR', 'SUPER_ADMIN'),
    ProductController.deleteProduct
);

export const ProductRoutes = router;

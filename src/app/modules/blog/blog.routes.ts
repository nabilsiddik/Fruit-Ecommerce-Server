import { Router } from 'express';
import { BlogController } from './blog.controller.js';
import { checkAuth } from '../../middleware/checkAuth.js';

const router = Router();

router.get('/', BlogController.getAllBlogs);
router.get('/:id', BlogController.getBlogById);

router.post(
    '/',
    checkAuth('ADMIN', 'VENDOR', 'SUPER_ADMIN'),
    BlogController.createBlog
);

router.patch(
    '/:id',
    checkAuth('ADMIN', 'VENDOR', 'SUPER_ADMIN'),
    BlogController.updateBlog
);

router.delete(
    '/:id',
    checkAuth('ADMIN', 'VENDOR', 'SUPER_ADMIN'),
    BlogController.deleteBlog
);

export const BlogRoutes = router;

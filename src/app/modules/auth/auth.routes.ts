import { Router } from 'express';
import validateRequest from '../../middleware/validateRequest.js';
import { AuthValidation } from './auth.validation.js';
import { AuthController } from './auth.controller.js';


const router = Router();

router.post(
    '/register',
    validateRequest(AuthValidation.registerValidationSchema),
    AuthController.registerUser
);

router.post(
    '/login',
    validateRequest(AuthValidation.loginValidationSchema),
    AuthController.loginUser
);

export const AuthRoutes = router;

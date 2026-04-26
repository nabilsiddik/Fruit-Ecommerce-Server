import { z } from 'zod';

const registerValidationSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['USER', 'VENDOR']).optional(),
});

const loginValidationSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};

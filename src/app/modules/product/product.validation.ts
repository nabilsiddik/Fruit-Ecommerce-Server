import { z } from 'zod';

const createProductValidationSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  slug: z.string().min(1, { message: 'Slug is required' }),
  shortDesc: z.string().optional(),
  longDesc: z.string().optional(),
  regularPrice: z.number().optional(),
  salePrice: z.number().min(0, { message: 'Sale price is required' }),
  sku: z.string().optional(),
  stockQuantity: z.number().default(0),
  stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER']).default('IN_STOCK'),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const ProductValidation = {
  createProductValidationSchema,
};

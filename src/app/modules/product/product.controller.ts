import type{ Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { ProductService } from './product.service.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';
import { pick } from '../../utils/pick.js';
import { productFilterableFields } from './product.constants.js';

const createProduct = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await ProductService.createProduct(req.body, req.user.id);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Product created successfully",
        data: result
    });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    
    const result = await ProductService.getAllProducts(filters, options);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Products fetched successfully",
        meta: result.meta,
        data: result.data
    });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.getProductById(req.params.id as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product fetched successfully",
        data: result
    });
});

const updateProduct = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await ProductService.updateProduct(req.params.id as string, req.body, req.user.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product updated successfully",
        data: result
    });
});

const deleteProduct = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await ProductService.deleteProduct(req.params.id as string, req.user.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product deleted successfully",
        data: result
    });
});

export const ProductController = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};

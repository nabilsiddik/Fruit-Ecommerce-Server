import type{ Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { CategoryService } from './category.service.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.createCategory(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Category created successfully",
        data: result
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategories();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Categories fetched successfully",
        data: result
    });
});

export const CategoryController = {
    createCategory,
    getAllCategories
};

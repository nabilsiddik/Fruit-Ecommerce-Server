import type{ Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { BlogService } from './blog.service.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';
import { pick } from '../../utils/pick.js';

const createBlog = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await BlogService.createBlog(req.user.id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Blog created successfully",
        data: result
    });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, ['searchTerm', 'category']);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await BlogService.getAllBlogs(filters, options);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Blogs fetched successfully",
        meta: result.meta,
        data: result.data
    });
});

const getBlogById = catchAsync(async (req: Request, res: Response) => {
    const result = await BlogService.getBlogById(req.params.id as string);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Blog fetched successfully",
        data: result
    });
});

const updateBlog = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await BlogService.updateBlog(req.params.id as string, req.body, req.user.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Blog updated successfully",
        data: result
    });
});

const deleteBlog = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await BlogService.deleteBlog(req.params.id as string, req.user.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Blog deleted successfully",
        data: result
    });
});

export const BlogController = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
};

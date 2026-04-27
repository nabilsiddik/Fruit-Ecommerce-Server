import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { UserService } from './user.service.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';
import { pick } from '../../utils/pick.js';

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, ['searchTerm', 'status']);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

    const result = await UserService.getAllCustomers(filters, options);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Customers fetched successfully",
        meta: result.meta,
        data: result.data
    });
});

const getCustomerById = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getCustomerById(req.params.id as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Customer fetched successfully",
        data: result
    });
});

const getMyProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await UserService.getMyProfile(req.user.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Profile fetched successfully",
        data: result
    });
});

const updateProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await UserService.updateProfile(req.user.id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Profile updated successfully",
        data: result
    });
});

export const UserController = {
    getAllCustomers,
    getCustomerById,
    getMyProfile,
    updateProfile
};

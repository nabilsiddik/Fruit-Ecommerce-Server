import type{ Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { OrderService } from './order.service.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';
import { pick } from '../../utils/pick.js';

const createOrder = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await OrderService.createOrder(req.user.id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Order placed successfully",
        data: result
    });
});

const getMyOrders = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await OrderService.getMyOrders(req.user.id, options);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Orders fetched successfully",
        meta: result.meta,
        data: result.data
    });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, ['searchTerm', 'status']);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await OrderService.getAllOrders(filters, options);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Orders fetched successfully",
        meta: result.meta,
        data: result.data
    });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.getOrderById(req.params.id as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order fetched successfully",
        data: result
    });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.updateOrderStatus(req.params.id as string, req.body.status);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order status updated successfully",
        data: result
    });
});

export const OrderController = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus
};

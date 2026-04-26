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

export const OrderController = {
    createOrder,
    getMyOrders
};

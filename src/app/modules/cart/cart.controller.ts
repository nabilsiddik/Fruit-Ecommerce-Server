import type{ Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { CartService } from './cart.service.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';

const getCart = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await CartService.getCart(req.user.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Cart fetched successfully",
        data: result
    });
});

const addToCart = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await CartService.addToCart(req.user.id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Item added to cart",
        data: result
    });
});

const updateCartQuantity = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const result = await CartService.updateCartQuantity(req.user.id, itemId as string, quantity);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Cart updated successfully",
        data: result
    });
});

const removeFromCart = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const { itemId } = req.params;
    const result = await CartService.removeFromCart(req.user.id, itemId as string);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Item removed from cart",
        data: result
    });
});

const clearCart = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const result = await CartService.clearCart(req.user.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Cart cleared successfully",
        data: result
    });
});

export const CartController = {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
};

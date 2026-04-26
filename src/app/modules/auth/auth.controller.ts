import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync.js';
import { AuthService } from './auth.service.js';
import type { Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse.js';

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.registerUser(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "User registered successfully",
        data: result
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.loginUser(req.body);

    res.cookie('refreshToken', result.refreshToken, {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Login successful",
        data: {
            accessToken: result.accessToken,
            user: result.user
        }
    });
});

export const AuthController = {
    registerUser,
    loginUser
};

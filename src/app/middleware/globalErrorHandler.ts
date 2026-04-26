import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { envVars } from "../config/env.config.js";
import { Prisma } from "../../../generated/prisma/client.js";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === 'development') {
        console.error(err);
    }

    let statusCode: number = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || 'Something went wrong';
    let error = err;

    // Handle Prisma Errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            message = `Duplicate key error`;
            error = err.meta;
            statusCode = StatusCodes.CONFLICT;
        } else if (err.code === 'P2025') {
            message = 'Record not found';
            error = err.meta;
            statusCode = StatusCodes.NOT_FOUND;
        } else if (err.code === 'P1000') {
            message = 'Authentication failed against database server';
            error = err.meta;
            statusCode = StatusCodes.UNAUTHORIZED;
        } else if (err.code === 'P2003') {
            message = 'Foreign key constraint failed on the field';
            error = err.meta;
            statusCode = StatusCodes.BAD_REQUEST;
        }
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        message = 'Unknown prisma error occurred';
        error = err.message;
        statusCode = StatusCodes.BAD_REQUEST;
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        message = 'Prisma client failed to initialize';
        error = err.message;
        statusCode = StatusCodes.BAD_REQUEST;
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        message = 'Prisma Validation Error';
        error = err.message;
        statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.name === 'ZodError') {
        message = 'Zod Validation Error';
        error = err.issues || err;
        statusCode = StatusCodes.BAD_REQUEST;
    }

    res.status(statusCode).json({
        success,
        message,
        error: envVars.NODE_ENV === 'development' ? error : undefined
    });
};

export default globalErrorHandler;

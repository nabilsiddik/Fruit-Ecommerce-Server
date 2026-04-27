import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { OverviewService } from './overview.service.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';

const getDashboardData = catchAsync(async (req: Request, res: Response) => {
    const stats = await OverviewService.getStats();
    const salesTracking = await OverviewService.getSalesTracking();
    const categoryDistribution = await OverviewService.getCategoryDistribution();
    const recentPayments = await OverviewService.getRecentPayments();
    const stockAlerts = await OverviewService.getStockAlerts();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Dashboard data fetched successfully",
        data: {
            stats,
            salesTracking,
            categoryDistribution,
            recentPayments,
            stockAlerts
        }
    });
});

export const OverviewController = {
    getDashboardData
};

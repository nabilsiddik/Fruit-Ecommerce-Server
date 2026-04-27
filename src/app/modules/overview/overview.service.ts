import { prisma } from '../../config/prisma.config.js';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

const getStats = async () => {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count({ where: { isDeleted: false } });
    const totalCustomers = await prisma.user.count({ where: { role: 'USER' } });
    
    const salesData = await prisma.order.aggregate({
        _sum: {
            totalAmount: true
        }
    });

    return {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue: salesData._sum.totalAmount || 0
    };
};

const getSalesTracking = async () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    const salesByDay = await Promise.all(
        last7Days.map(async (day: Date) => {
            const start = startOfDay(day);
            const end = endOfDay(day);
            
            const sales = await prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: start,
                        lte: end
                    },
                    status: { not: 'CANCELLED' }
                },
                _sum: {
                    totalAmount: true
                }
            });

            return {
                day: format(day, 'EEE'),
                sales: sales._sum.totalAmount || 0
            };
        })
    );

    return salesByDay;
};

const getCategoryDistribution = async () => {
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        }
    });

    return categories.map((cat: any) => ({
        name: cat.name,
        value: cat._count.products
    }));
};

const getRecentPayments = async () => {
    // Assuming payments are linked to orders or tracked separately
    // For now, let's return recent completed orders
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { fullName: true, email: true } }
        }
    });

    return recentOrders.map((order: any) => ({
        id: order.id,
        customer: order.user.fullName,
        amount: order.totalAmount,
        status: order.paymentStatus,
        date: order.createdAt
    }));
};

const getStockAlerts = async () => {
    const lowStockProducts = await prisma.product.findMany({
        where: {
            stockQuantity: { lte: 10 },
            isDeleted: false
        },
        take: 10,
        orderBy: { stockQuantity: 'asc' }
    });

    return lowStockProducts;
};

export const OverviewService = {
    getStats,
    getSalesTracking,
    getCategoryDistribution,
    getRecentPayments,
    getStockAlerts
};

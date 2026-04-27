import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/prisma.config.js';
import { paginationHelper } from '../../utils/paginationHelper.js';
import AppError from '../../error/AppError.js';

const createOrder = async (userId: string, payload: any) => {
    const { items, shippingAddress, contactNumber, paymentMethod } = payload;

    // Start transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        let totalAmount = 0;

        // Calculate total and check stock
        for (const item of items) {
            const product = await tx.product.findUnique({
                where: { id: item.productId }
            });

            if (!product) throw new AppError(StatusCodes.NOT_FOUND, `Product not found`);
            if (product.stockQuantity < item.quantity) {
                throw new AppError(StatusCodes.BAD_REQUEST, `Insufficient stock for ${product.name}`);
            }

            totalAmount += product.salePrice * item.quantity;
        }

        const orderNumber = `ORD-${Date.now()}`;

        const order = await tx.order.create({
            data: {
                orderNumber,
                userId,
                totalAmount,
                shippingAddress,
                contactNumber,
                paymentMethod,
                orderItems: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: 0 // Will be updated below or handled differently
                    }))
                }
            },
            include: { orderItems: true }
        });

        // Update item prices and decrease stock
        for (const item of items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            
            await tx.orderItem.updateMany({
                where: { orderId: order.id, productId: item.productId },
                data: { price: product!.salePrice }
            });

            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stockQuantity: { decrement: item.quantity },
                    stockStatus: (product!.stockQuantity - item.quantity) <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK'
                }
            });
        }

        return order;
    });

    return result;
};

const getMyOrders = async (userId: string, options: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const result = await prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            orderItems: {
                include: { product: true }
            }
        }
    });

    const total = await prisma.order.count({ where: { userId } });

    return {
        meta: { page, limit, total },
        data: result
    };
};

const getAllOrders = async (filters: any, options: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, status, ...filterData } = filters;

    const andConditions: Prisma.OrderWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
                { contactNumber: { contains: searchTerm, mode: 'insensitive' } }
            ]
        });
    }

    if (status) {
        andConditions.push({ status });
    }

    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.order.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            user: { select: { fullName: true, email: true } },
            orderItems: { include: { product: true } }
        }
    });

    const total = await prisma.order.count({ where: whereConditions });

    return {
        meta: { page, limit, total },
        data: result
    };
};

const getOrderById = async (id: string) => {
    const result = await prisma.order.findUnique({
        where: { id },
        include: {
            user: { select: { fullName: true, email: true, phoneNumber: true } },
            orderItems: { include: { product: true } }
        }
    });
    if (!result) throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
    return result;
};

const updateOrderStatus = async (id: string, status: any) => {
    return await prisma.order.update({
        where: { id },
        data: { status }
    });
};

export const OrderService = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus
};

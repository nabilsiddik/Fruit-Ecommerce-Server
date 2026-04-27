import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/prisma.config.js';
import AppError from '../../errors/AppError.js';
import { paginationHelper } from '../../utils/paginationHelper.js';
import { Prisma } from '@prisma/client';

const getAllCustomers = async (filters: any, options: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.UserWhereInput[] = [];

    andConditions.push({ role: 'USER', isDeleted: false });

    if (searchTerm) {
        andConditions.push({
            OR: ['fullName', 'email', 'phoneNumber'].map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            status: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true
        }
    });

    const total = await prisma.user.count({ where: whereConditions });

    return {
        meta: { page, limit, total },
        data: result
    };
};

const getCustomerById = async (id: string) => {
    const result = await prisma.user.findUnique({
        where: { id, isDeleted: false },
        select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            status: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
            orders: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    if (!result) throw new AppError(StatusCodes.NOT_FOUND, "Customer not found");
    return result;
};

const getMyProfile = async (id: string) => {
    const result = await prisma.user.findUnique({
        where: { id, isDeleted: false },
        include: {
            shop: true,
            orders: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            },
            addresses: true
        }
    });
    if (!result) throw new AppError(StatusCodes.NOT_FOUND, "Profile not found");
    return result;
};

const updateProfile = async (id: string, payload: any) => {
    const result = await prisma.user.update({
        where: { id },
        data: payload,
        select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profileImage: true
        }
    });
    return result;
};

export const UserService = {
    getAllCustomers,
    getCustomerById,
    getMyProfile,
    updateProfile
};

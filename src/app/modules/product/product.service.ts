import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.config.js';
import { paginationHelper } from '../../utils/paginationHelper.js';
import { productSearchableFields } from './product.constants.js';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../error/AppError.js';

const createProduct = async (payload: any, userId: string) => {
    // 1. Get System Configuration
    const config = await prisma.systemConfig.findUnique({ where: { id: "singleton" } });
    const isMultiVendor = config?.isMultiVendorEnabled ?? true;

    let targetShopId: string;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (isMultiVendor) {
        const vendorShop = await prisma.shop.findUnique({ where: { vendorId: userId } });
        if (!vendorShop) throw new AppError(StatusCodes.FORBIDDEN, "You don't have an active shop.");
        targetShopId = vendorShop.id;
    } else {
        if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
            throw new AppError(StatusCodes.FORBIDDEN, "Only admins can upload products in Single-Vendor mode.");
        }
        const adminShop = await prisma.shop.findFirst({
            where: { vendor: { role: 'SUPER_ADMIN' } }
        });
        if (!adminShop) throw new AppError(StatusCodes.NOT_FOUND, "Platform shop not initialized.");
        targetShopId = adminShop.id;
    }

    const { categories, tags, ...productData } = payload;

    // Generate slug if not provided
    if (!productData.slug) {
        productData.slug = productData.name.toLowerCase().split(' ').join('-') + '-' + Date.now();
    }

    return await prisma.product.create({
        data: {
            ...productData,
            shop: { connect: { id: targetShopId } },
            ...(categories?.length && {
                categories: {
                    connect: categories.map((id: string) => ({ id })),
                },
            }),
            ...(tags?.length && {
                tags: {
                    connect: tags.map((id: string) => ({ id })),
                },
            }),
        }
    });
};

const getAllProducts = async (filters: any, options: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, minPrice, maxPrice, category, shopId, ...filterData } = filters;

    const andConditions: Prisma.ProductWhereInput[] = [];

    andConditions.push({ isDeleted: false });

    if (searchTerm) {
        andConditions.push({
            OR: productSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }

    if (minPrice) {
        andConditions.push({ salePrice: { gte: parseFloat(minPrice) } });
    }

    if (maxPrice) {
        andConditions.push({ salePrice: { lte: parseFloat(maxPrice) } });
    }

    if (category) {
        andConditions.push({
            categories: {
                some: {
                    OR: [
                        { id: category },
                        { slug: category },
                        { name: { contains: category, mode: 'insensitive' } }
                    ]
                }
            }
        });
    }

    if (shopId) {
        andConditions.push({ shopId });
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

    const whereConditions: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.product.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            shop: {
                include: {
                    vendor: {
                        select: {
                            fullName: true,
                            profileImage: true
                        }
                    }
                }
            },
            categories: true,
            brand: true,
            reviews: true
        }
    });

    const total = await prisma.product.count({ where: whereConditions });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
};

const getProductById = async (id: string) => {
    const result = await prisma.product.findUnique({
        where: { id, isDeleted: false },
        include: {
            shop: true,
            categories: true,
            brand: true,
            variants: true,
            reviews: {
                include: {
                    user: {
                        select: { fullName: true, profileImage: true }
                    }
                }
            }
        }
    });
    if (!result) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    return result;
};

const updateProduct = async (id: string, payload: any, userId: string) => {
    const product = await prisma.product.findUnique({ where: { id, isDeleted: false }, include: { shop: true } });
    if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");

    // Authorization check
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && product.shop.vendorId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to update this product");
    }

    const { categories, tags, ...productData } = payload;

    return await prisma.$transaction(async (tx) => {
        // Disconnect existing categories/tags if provided
        if (categories) {
            await tx.product.update({
                where: { id },
                data: { categories: { set: [] } }
            });
        }
        if (tags) {
            await tx.product.update({
                where: { id },
                data: { tags: { set: [] } }
            });
        }

        return await tx.product.update({
            where: { id },
            data: {
                ...productData,
                ...(categories?.length && {
                    categories: {
                        connect: categories.map((id: string) => ({ id })),
                    },
                }),
                ...(tags?.length && {
                    tags: {
                        connect: tags.map((id: string) => ({ id })),
                    },
                }),
            },
            include: { categories: true, tags: true }
        });
    });
};

const deleteProduct = async (id: string, userId: string) => {
    const product = await prisma.product.findUnique({ where: { id, isDeleted: false }, include: { shop: true } });
    if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && product.shop.vendorId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to delete this product");
    }

    return await prisma.product.update({
        where: { id },
        data: { isDeleted: true }
    });
};

export const ProductService = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};

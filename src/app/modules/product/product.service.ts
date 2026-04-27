import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.config.js";
import { paginationHelper } from "../../utils/paginationHelper.js";
import { productSearchableFields } from "./product.constants.js";

const createProduct = async (payload: any, userId: string) => {
    // 1. Get System Configuration
    const config = await prisma.systemConfig.findUnique({ where: { id: "singleton" } });
    const isMultiVendor = config?.isMultiVendorEnabled ?? true;

    let targetShopId: string;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (isMultiVendor) {
        const vendorShop = await prisma.shop.findUnique({ where: { vendorId: userId } });
        if (!vendorShop) throw new Error("You don't have an active shop.");
        targetShopId = vendorShop.id;
    } else {
        if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
            throw new Error("Only admins can upload products in Single-Vendor mode.");
        }
        const adminShop = await prisma.shop.findFirst({
            where: { vendor: { role: 'SUPER_ADMIN' } }
        });
        if (!adminShop) throw new Error("Platform shop not initialized.");
        targetShopId = adminShop.id;
    }

    const { categories, tags, ...productData } = payload;

    return await prisma.product.create({
        data: {
            ...productData,
            shop: { connect: { id: targetShopId } },
            user: { connect: { id: userId } },
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
    const { searchTerm, minPrice, maxPrice, category, ...filterData } = filters;

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
                    slug: category
                }
            }
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

    const whereConditions: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.product.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            shop: true,
            categories: true,
            user: {
                select: {
                    fullName: true,
                    profileImage: true
                }
            }
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

export const ProductService = {
    createProduct,
    getAllProducts
};

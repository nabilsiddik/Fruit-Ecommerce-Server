import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.config.js';
import { paginationHelper } from '../../utils/paginationHelper.js';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../error/AppError.js';

const createBlog = async (userId: string, payload: any) => {
    if (!payload.slug) {
        payload.slug = payload.title.toLowerCase().split(' ').join('-') + '-' + Date.now();
    }
    return await prisma.blog.create({
        data: {
            ...payload,
            authorId: userId
        }
    });
};

const getAllBlogs = async (filters: any, options: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, category } = filters;

    const andConditions: Prisma.BlogWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { content: { contains: searchTerm, mode: 'insensitive' } }
            ]
        });
    }

    if (category) {
        andConditions.push({ category: { equals: category } });
    }

    const whereConditions: Prisma.BlogWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.blog.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [sortBy as any]: sortOrder },
        include: {
            author: {
                select: { fullName: true, profileImage: true }
            }
        }
    });

    const total = await prisma.blog.count({ where: whereConditions });

    return {
        meta: { page, limit, total },
        data: result
    };
};

const getBlogById = async (id: string) => {
    const result = await prisma.blog.findUnique({
        where: { id },
        include: {
            author: {
                select: { fullName: true, profileImage: true }
            }
        }
    });
    if (!result) throw new AppError(StatusCodes.NOT_FOUND, "Blog not found");
    return result;
};

const updateBlog = async (id: string, payload: any, userId: string) => {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new AppError(StatusCodes.NOT_FOUND, "Blog not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && blog.authorId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, "Unauthorized");
    }

    return await prisma.blog.update({
        where: { id },
        data: payload
    });
};

const deleteBlog = async (id: string, userId: string) => {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new AppError(StatusCodes.NOT_FOUND, "Blog not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && blog.authorId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, "Unauthorized");
    }

    return await prisma.blog.delete({ where: { id } });
};

export const BlogService = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
};

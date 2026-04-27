import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/prisma.config.js';
import AppError from '../../error/AppError.js';

const getCart = async (userId: string) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: { items: { include: { product: true } } }
        });
    }

    return cart;
};

const addToCart = async (userId: string, payload: { productId: string, quantity: number }) => {
    const cart = await getCart(userId);
    
    const existingItem = await prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: cart.id,
                productId: payload.productId
            }
        }
    });

    if (existingItem) {
        return await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + (payload.quantity || 1) }
        });
    }

    return await prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId: payload.productId,
            quantity: payload.quantity || 1
        }
    });
};

const updateCartQuantity = async (userId: string, itemId: string, quantity: number) => {
    const cart = await getCart(userId);
    
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
        throw new AppError(StatusCodes.NOT_FOUND, "Cart item not found");
    }

    if (quantity <= 0) {
        return await prisma.cartItem.delete({ where: { id: itemId } });
    }

    return await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
    });
};

const removeFromCart = async (userId: string, itemId: string) => {
    const cart = await getCart(userId);
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    
    if (!item || item.cartId !== cart.id) {
        throw new AppError(StatusCodes.NOT_FOUND, "Cart item not found");
    }

    return await prisma.cartItem.delete({ where: { id: itemId } });
};

const clearCart = async (userId: string) => {
    const cart = await getCart(userId);
    return await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
    });
};

export const CartService = {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
};

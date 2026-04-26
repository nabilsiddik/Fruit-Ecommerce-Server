import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/prisma.config.js';
import AppError from '../../error/AppError.js';
import { generateJwtToken } from '../../utils/jwtToken.js';
import { envVars } from '../../config/env.config.js';
import bcrypt from 'bcryptjs';


const registerUser = async (payload: any) => {
    const isUserExist = await prisma.user.findUnique({
        where: { email: payload.email }
    });

    if (isUserExist) {
        throw new AppError(StatusCodes.CONFLICT, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(payload.password, Number(envVars.SALT_ROUND));

    const result = await prisma.user.create({
        data: {
            ...payload,
            password: hashedPassword
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    return result;
};

const loginUser = async (payload: any) => {
    const user = await prisma.user.findUnique({
        where: { email: payload.email, isDeleted: false }
    });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (user.status === 'BLOCKED') {
        throw new AppError(StatusCodes.FORBIDDEN, "Account is blocked");
    }

    const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordMatch) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    const accessToken = generateJwtToken(
        jwtPayload,
        envVars.JWT.JWT_ACCESS_SECRET,
        '1d'
    );

    const refreshToken = generateJwtToken(
        jwtPayload,
        envVars.JWT.JWT_REFRESH_SECRET,
        '30d'
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        }
    };
};

export const AuthService = {
    registerUser,
    loginUser
};

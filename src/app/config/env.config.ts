import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

interface EnvConfig {
    PORT: string;
    NODE_ENV: string;
    DATABASE_URL: string;
    SALT_ROUND: string;
    CLIENT_URL: string;
    JWT: {
        JWT_ACCESS_SECRET: string;
        JWT_REFRESH_SECRET: string;
    };
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
    };
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVars: string[] = [
        'PORT', 'DATABASE_URL', 'NODE_ENV', 'SALT_ROUND', 
        'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 
        'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'
    ];

    requiredEnvVars.forEach((key: string) => {
        if (!process.env[key]) {
            console.warn(`Env Variable ${key} is missing on .env file.`);
        }
    });

    return {
        PORT: process.env.PORT || '3000',
        DATABASE_URL: process.env.DATABASE_URL || '',
        NODE_ENV: process.env.NODE_ENV || 'development',
        SALT_ROUND: process.env.SALT_ROUND || '12',
        CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
        JWT: {
            JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'secret',
            JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'secret',
        },
        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
        },
    };
};

export const envVars = loadEnvVariables();

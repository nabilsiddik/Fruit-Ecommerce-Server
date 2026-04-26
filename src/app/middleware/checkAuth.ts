import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { JWTPayload } from "../interface/index.js";
import AppError from "../error/AppError.js";
import { verifyToken } from "../utils/jwtToken.js";
import { envVars } from "../config/env.config.js";

export const checkAuth = (...roles: string[]) => {
  return async (
    req: Request & { user?: JWTPayload },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      let token: string | undefined;
      if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      } else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;

        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        }
      }

      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Token not found");
      }

      const verifiedToken = verifyToken(token, envVars.JWT.JWT_ACCESS_SECRET);

      if (!verifiedToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      req.user = verifiedToken;

      if (roles.length && !roles.includes(verifiedToken.role)) {
        throw new AppError(StatusCodes.FORBIDDEN, "You are forbidden from this action");
      }

      next();
    } catch (err: unknown) {
      next(err);
    }
  };
};

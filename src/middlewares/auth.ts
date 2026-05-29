import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../types/IUser";
import CatchAsyncError from "./catchAsyncError";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
import UserModel, { IUserDocument } from "../models/user.model";

declare module 'express-serve-static-core' {
    interface Request {
        user?: IUserDocument;
    }
}

interface DecodedToken extends JwtPayload {
    id: string;
}

// authenticated user
export const isAuthenticated = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new ErrorHandler("Please login to access this resource", 403));
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return next(new ErrorHandler("Please login to access this resource", 403));
        }
        const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET) as DecodedToken;
        if(!decoded) {
            return next(new ErrorHandler("Invalid Token", 403));
        }

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return next(new ErrorHandler("Invalid user or token", 403));
        }

        req.user = user;
        next();
    }
);
import { UserRole } from "../types/UserRole";

export const authorizeRoles = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            return next(new ErrorHandler("You're not allowed to access this resource!", 403));
        }
        next();
    }
}
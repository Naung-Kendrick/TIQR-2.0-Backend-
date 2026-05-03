import { NextFunction, Request, Response } from "express";
import CatchAsyncError from "../middlewares/catchAsyncError";
import { IUser } from "../types/IUser";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel, { IUserDocument } from "../models/user.model";
import { deleteFile, upload, uploadFile } from "../middlewares/upload";
import { UserRole } from "../types/UserRole";

// Register User
export const register = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password, phone, township } = req.body;

        if (!name || !email || !password || !township) {
            return next(new ErrorHandler("Please enter all required fields including Township", 400))
        }

        const isEmailExist = await UserModel.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exists!", 400))
        }

        const user = await UserModel.create({ name, email, password, phone, township });

        res.status(201).json({
            success: true,
            user,
        })
    }
);

// Login User
export const login = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400))
        }

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid Credentials!", 403))
        }

        const isPasswordMatch = await (user as any).comparePassword(password);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid Credentials!", 403))
        }

        if (!(user as any).active) {
            return next(new ErrorHandler("Your account is pending authorization. Please contact Root Admin.", 403))
        }

        // Update lastSeen on login
        user.lastSeen = new Date();
        await (user as any).save({ validateModifiedOnly: true });

        const accessToken = (user as any).signAccessToken();

        res.status(201).json({
            success: true,
            accessToken,
            user,
        })
    }
);

// Get Current User Info
export const getCurrentUserInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({
            success: true,
            user: req.user,
        })
    }
);

// Get User Info By Id
export const getUserById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user,
        })
    }
);

// Get All Users
export const getAllUsers = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const users = await UserModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            users,
        })
    }
);

// Update user info
export const updateUserInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, phone, active } = req.body;
        const currentUserId = req.user?._id;

        const user = await UserModel.findById(currentUserId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (active !== undefined && (active !== user.active)) user.active = active;
        if (email && email !== user.email) {
            const isEmailExist = await UserModel.findOne({ email });
            if (isEmailExist) {
                return next(new ErrorHandler("Email already exists", 400));
            }
            user.email = email;
        }

        const updatedUser = await (user as any).save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Update user password
export const updateUserPassword = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user?._id;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("Old and new passwords are required", 400));
        }

        const user = await UserModel.findById(currentUserId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isPasswordMatch = await (user as any).comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Incorrect old password", 400));
        }

        user.password = newPassword;
        const updatedUser = await (user as any).save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Upload user avatar
export const uploadUserAvatar = [
    upload.single("file"),
    CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user?._id;
        const file = (req as any)?.file;

        const user = await UserModel.findById(currentUserId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (user.avatar && user.avatar.startsWith("https")) {
            await deleteFile(user.avatar);
        }

        const avatarUrl = await uploadFile(file);
        user.avatar = avatarUrl;
        const updatedUser = await (user as any).save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    })
]

// Update user role by admin
export const updateUserRoleByAdmin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user?._id?.toString();
        const currentUserRole = req.user?.role;
        const { userId, role } = req.body;

        if (!userId || typeof role !== "number") {
            return next(new ErrorHandler("UserId and role are required", 400));
        }    
        
        if (currentUserId === userId) {
            return next(new ErrorHandler("You can't change your role", 400));
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (currentUserRole !== UserRole.ROOT_ADMIN) {
            return next(new ErrorHandler("Only root admin can change roles", 403));
        }

        user.role = role;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Update user password by admin
export const updateUserPwdByAdmin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserRole = req.user?.role;
        const { userId, newPassword } = req.body;

        if (!userId || !newPassword) {
            return next(new ErrorHandler("UserId and password are required", 400));
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (currentUserRole === UserRole.ADMIN && user.role !== UserRole.USER) {
            return next(new ErrorHandler("You can only change regular user passwords", 403));
        }

        user.password = newPassword;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Delete user by admin
export const deleteUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "User is deleted successfully!",
        })
    }
);

// Update user status by admin
export const updateUserStatusByAdmin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId, active } = req.body;

        if (!userId || typeof active !== "boolean") {
            return next(new ErrorHandler("UserId and status are required", 400));
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        user.active = active;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Heartbeat - update lastSeen for authenticated user
export const heartbeat = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?._id;
        if (!userId) {
            return next(new ErrorHandler("Not authenticated", 401));
        }

        await UserModel.findByIdAndUpdate(userId, { lastSeen: new Date() });

        res.status(200).json({ success: true });
    }
);

// Get online users (seen in last 5 minutes)
export const getOnlineUsers = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const onlineUsers = await UserModel.find(
            { lastSeen: { $gte: fiveMinutesAgo }, active: true, role: { $ne: UserRole.ROOT_ADMIN } },
            { name: 1, township: 1, lastSeen: 1 }
        ).sort({ lastSeen: -1 });

        res.status(200).json({
            success: true,
            onlineUsers,
        });
    }
);
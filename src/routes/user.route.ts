import express from "express";
import { deleteUser, getAllUsers, getCurrentUserInfo, getUserById, login, register, updateUserInfo, updateUserPassword, updateUserPwdByAdmin, updateUserRoleByAdmin, uploadUserAvatar, updateUserStatusByAdmin, heartbeat, getOnlineUsers } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { UserRole } from "../types/UserRole";

const userRouter = express.Router();

// Public routes
userRouter.post('/register', register);
userRouter.post('/login', login);

// Authenticated routes
userRouter.get('/me', isAuthenticated, getCurrentUserInfo);
userRouter.post('/heartbeat', isAuthenticated, heartbeat);
userRouter.get('/online', isAuthenticated, getOnlineUsers);
userRouter.get('/:id', isAuthenticated, getUserById);
userRouter.get('/', isAuthenticated, getAllUsers);
userRouter.patch('/', isAuthenticated, updateUserInfo);
userRouter.patch('/update-pwd', isAuthenticated, updateUserPassword);
userRouter.patch('/update-avatar', isAuthenticated, uploadUserAvatar);

// Admin routes
userRouter.patch('/update-role', isAuthenticated, authorizeRoles([UserRole.ROOT_ADMIN]), updateUserRoleByAdmin);
userRouter.patch('/update-pwd-admin', isAuthenticated, authorizeRoles([UserRole.ROOT_ADMIN, UserRole.ADMIN]), updateUserPwdByAdmin);
userRouter.patch('/update-status', isAuthenticated, authorizeRoles([UserRole.ROOT_ADMIN, UserRole.ADMIN]), updateUserStatusByAdmin);
userRouter.delete('/:id', isAuthenticated, authorizeRoles([UserRole.ROOT_ADMIN]), deleteUser);

export default userRouter;
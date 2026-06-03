import { UserRole } from "./UserRole";

export interface IUser {
    _id?: any;
    name: string;
    email: string;
    phone?: string;
    township?: string;
    password: string;
    avatar?: string;
    role: UserRole;
    active: boolean;
    lastSeen?: Date;
    lastLoginAt?: Date;
    dailyLoginCount?: number;
    lastLoginDate?: Date;
    dailyLoginLimit?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
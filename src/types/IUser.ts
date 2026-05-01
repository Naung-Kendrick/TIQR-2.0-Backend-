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
    createdAt?: Date;
    updatedAt?: Date;
}
import type { IRole } from "./role";

export interface IAdmin {
    adminId: string;
    username?: string;
    fullName: string;
    role?: IRole;
    permissions?: {
        permissionId: string;
        module: string;
        read: boolean;
        write: boolean;
    }[]
    isActive: boolean;
    modules?: string[];
    avatarUrl?: string;
    publicId?: string;
    createdAt: string;
    updatedAt: string;
}
import type { IAdmin } from "services/admin/admin.types";

export interface ILogin {
    username: string;
    password: string;
}

export interface IResponseAuth {
    accessToken: string;
    admin: IAdmin;
}
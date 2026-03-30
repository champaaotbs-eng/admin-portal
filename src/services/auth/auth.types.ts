import type { IAdmin } from "types/admin";

export interface ILogin {
    username: string;
    password: string;
}

export interface IResponseAuth {
    accessToken: string;
    admin: IAdmin;
}
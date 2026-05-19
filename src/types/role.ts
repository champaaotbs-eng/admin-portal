export enum RoleEnum {
    ADMIN = 'admin',
    BUS_COMPANY = 'bus_company',
    CUSTOMER = 'customer',
}

export type TRole = keyof typeof RoleEnum

export interface IRole {
    roleId: string;

    roleName: string;

    type: 'system_admin' | 'company_admin';

    busCompanyId?: string | null;

    assignedAdminCount?: number;

    isActive: boolean;

    description?: string;

    permissions: {
        module: string;
        read: boolean;
        write: boolean;
    }[]
}

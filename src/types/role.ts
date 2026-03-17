export enum RoleEnum {
    ADMIN = 'admin',
    BUS_COMPANY = 'bus_company',
    CUSTOMER = 'customer',
}

export type TRole = keyof typeof RoleEnum
export interface ICompany {
    busCompanyId: string;
    name: string;
    email?: string;
    address?: string;
    phone?: string;
    serviceFee: number;
    logoUrl?: string;
    status: BusCompanyStatus;
    createdAt: Date;
}

export enum BusCompanyStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

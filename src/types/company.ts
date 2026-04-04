export interface ICompany {
    busCompanyId: string;
    name: string;
    email?: string;
    address?: string;
    phone?: string;
    serviceFee: number;
    logoUrl?: string;
    publicId?: string;
    status: BusCompanyStatus;
    companyAdmins?: ICompanyAdmins[];
    createdAt: Date;
}

export interface ICompanyAdmins {
    adminId: string;
    fullName: string;
    username: string;
    position: BusCompanyAdminPosition;
}

export enum BusCompanyStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export enum BusCompanyAdminPosition {
    OWNER = 'owner',
    STAFF = 'staff',
}

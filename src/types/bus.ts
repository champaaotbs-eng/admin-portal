import type { ISeatLayout } from './seat-layout'

export interface ICreateBus {
    companyId?: string
    busType: EBusType
    busCode: string
    busName: string
    seatLayoutId?: string
    description: string
    licensePlate: string
}

export interface IUpdateBus extends Partial<ICreateBus> { }

export interface IBus {
    busId: string
    companyId: string
    busType: EBusType
    busCode: string
    busName: string
    seatLayoutId?: string
    seatLayout?: ISeatLayout
    description: string
    licensePlate: string
    latestVersionId?: string
    latestVersion?: IBusVersion
    createdAt: string
    updatedAt: string
}

export interface IBusVersion {
    busVersionId: string
    busId: string
    versionNo: number
    driverPhone: string
    status: EBusVersionStatus
    createdAt: string
}

export enum EBusType {
    SEAT = 'SEAT',
    SLEEPER = 'SLEEPER',
    LIMOUSINE = 'LIMOUSINE',
}

export enum EBusVersionStatus {
    ACTIVE = 'ACTIVE',
    MAINTENANCE = 'MAINTENANCE',
    RETIRED = 'RETIRED',
}

import type { ISeatLayoutUpsertPayload } from './seat-layout'

export interface IBus {
    busId: string
    companyId: string
    busType: EBusType
    busCode: string
    busName: string
    seatLayoutId?: string
    seatLayout?: ISeatLayoutUpsertPayload
    description: string
    licensePlate: string
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

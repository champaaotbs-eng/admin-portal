import type { EPaymentMethod } from './booking'

export interface IRevenue {
    revenueId: string
    companyId: string
    bookingId: string
    grossAmount: number
    commission: number
    netAmount: number
    paymentType: EPaymentMethod
    createdAt: string
}

export interface ISettlement {
    settlementId: string
    companyId: string
    periodFrom: string
    periodTo: string
    totalGross: number
    totalCommission: number
    totalNet: number
    status: ESettlementStatus
    createdAt: string
}

export enum ESettlementStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
}

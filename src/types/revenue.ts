import type { EPaymentMethod } from './booking'

export interface IRevenue {
    id: string
    companyId: string
    bookingId: string
    grossAmount: number
    commission: number
    netAmount: number
    paymentType: EPaymentMethod
    createdAt: string
}

export interface IRevenueStats {
    totalGross: number
    totalCommission: number
    totalNet: number
    totalCount: number
    daily: { date: string; gross: number; commission: number; net: number }[]
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

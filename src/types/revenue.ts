import type { EPaymentMethod } from './booking'

export interface IRevenue {
    id: string
    companyId: string
    fee?: number
    companyName?: string
    companyInfo?: {
        companyId: string
        companyName?: string
    }
    bookingId: string
    bookingCode?: string
    grossAmount: number
    commission: number
    netAmount: number
    paymentType: EPaymentMethod
    passengerName?: string
    passengerEmail?: string
    passengerPhone?: string
    customerInfo?: {
        passengerName?: string
        passengerEmail?: string
        passengerPhone?: string
    }
    tripInfo?: {
        departureTime?: string
        arrivalTime?: string
        fromLocationName?: string
        toLocationName?: string
        busCompanyName?: string
        pickupStop?: {
            locationName?: string
            locationAddress?: string
            pickupTime?: string
            dropoffTime?: string
        }
        dropoffStop?: {
            locationName?: string
            locationAddress?: string
            pickupTime?: string
            dropoffTime?: string
        }
    }
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
    id: string
    settlementId?: string
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

import type { EPaymentMethod } from './booking'

export interface IPayment {
    paymentId: string
    bookingId: string
    paymentType: EPaymentMethod
    provider: EPaymentProvider | null
    method: EPaymentMethodType | null
    evidence: string | null
    confirmedByAdminId?: string | null
    confirmedCompanyId?: string | null
    confirmedAt?: string | null
    confirmationNote?: string | null
    collectedAmount?: number | null
    amount: number
    status: EPaymentStatus
    transactionCode: string | null
    createdAt: string
    completedAt: string | null
}

export enum EPaymentProvider {
    VNPAY = 'vnpay',
    MOMO = 'momo',
    STRIPE = 'stripe',
}

export enum EPaymentMethodType {
    QR = 'qr',
    ATM = 'atm',
    CREDIT_CARD = 'credit_card',
    CASH = 'cash',
    POS = 'pos',
}

export enum EPaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    EXPIRED = 'EXPIRED',
    CONFIRMED_ON_BOARD = 'CONFIRMED_ON_BOARD',
}

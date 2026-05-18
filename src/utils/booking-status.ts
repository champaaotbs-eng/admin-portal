import type { BadgeProps } from '@/components/ui/badge'

type BadgeVariant = NonNullable<BadgeProps['variant']>
type DerivedPaymentStatus = 'paid' | 'pending' | 'unpaid' | 'refunded' | 'failed' | 'expired' | 'completed'
type PaymentStatusMode = 'booking-filter' | 'dashboard'

const BOOKING_STATUS_VARIANTS: Record<string, BadgeVariant> = {
    confirmed: 'success',
    completed: 'success',
    reserved: 'warning',
    pending_payment: 'warning',
    cancelled: 'destructive',
    expired: 'secondary',
}

const PAYMENT_STATUS_VARIANTS: Record<string, BadgeVariant> = {
    paid: 'success',
    confirmed_on_board: 'success',
    pending: 'warning',
    unpaid: 'warning',
    completed: 'success',
    refunded: 'secondary',
    failed: 'destructive',
    expired: 'secondary',
}

const PAYMENT_METHOD_VARIANTS: Record<string, BadgeVariant> = {
    online: 'secondary',
    pay_on_board: 'warning',
}

export const normalizeStatusKey = (status?: string | null) => status?.toLowerCase() ?? ''

export const normalizeBookingStatus = (status: unknown, fallback = 'pending_payment') => {
    const normalized = normalizeStatusKey(String(status ?? ''))
    if (normalized === 'pending') return 'pending_payment'
    if (normalized === 'pending_payment') return 'pending_payment'
    if (normalized === 'reserved') return 'reserved'
    if (normalized === 'confirmed') return 'confirmed'
    if (normalized === 'cancelled') return 'cancelled'
    if (normalized === 'expired') return 'expired'
    if (normalized === 'completed') return 'completed'
    return fallback
}

export const normalizePaymentMethod = (method: unknown) => {
    const normalized = normalizeStatusKey(String(method ?? ''))
    if (normalized === 'pay_on_board') return 'pay_on_board'
    return 'online'
}

export const getPaymentMethodLabelKey = (method: unknown) =>
    `paymentMethod.${normalizePaymentMethod(method)}`

export const getPaymentMethodVariant = (method: unknown): BadgeVariant =>
    PAYMENT_METHOD_VARIANTS[normalizePaymentMethod(method)] ?? 'secondary'

export const normalizeRawPaymentStatus = (status: unknown): DerivedPaymentStatus | '' => {
    const normalized = String(status ?? '').toUpperCase()
    if (normalized === 'PAID' || normalized === 'CONFIRMED_ON_BOARD') return 'paid'
    if (normalized === 'REFUNDED') return 'refunded'
    if (normalized === 'FAILED') return 'failed'
    if (normalized === 'EXPIRED') return 'expired'
    if (normalized === 'COMPLETED') return 'completed'
    if (normalized === 'PENDING') return 'pending'
    return ''
}

export const derivePaymentStatus = (
    rawPaymentStatus: unknown,
    bookingStatus: unknown,
    mode: PaymentStatusMode = 'booking-filter',
): DerivedPaymentStatus => {
    const normalizedPayment = normalizeRawPaymentStatus(rawPaymentStatus)
    if (normalizedPayment === 'paid' || normalizedPayment === 'refunded' || normalizedPayment === 'failed' || normalizedPayment === 'expired') {
        return normalizedPayment
    }

    const normalizedBooking = normalizeBookingStatus(bookingStatus)
    if (normalizedBooking === 'confirmed' || normalizedBooking === 'completed') {
        return mode === 'dashboard' ? 'completed' : 'paid'
    }
    if (normalizedBooking === 'cancelled') {
        return mode === 'dashboard' ? 'refunded' : 'refunded'
    }

    return mode === 'dashboard' ? 'pending' : 'unpaid'
}

export const getBookingStatusVariant = (status?: string | null): BadgeVariant =>
    BOOKING_STATUS_VARIANTS[normalizeStatusKey(status)] ?? 'secondary'

export const getPaymentStatusVariant = (status?: string | null): BadgeVariant =>
    PAYMENT_STATUS_VARIANTS[normalizeStatusKey(status)] ?? 'secondary'

export const getBookingStatusLabelKey = (status?: string | null) => `status.${normalizeStatusKey(status)}`

export const getPaymentStatusLabelKey = (status?: string | null) => `payment_status.${normalizeStatusKey(status)}`

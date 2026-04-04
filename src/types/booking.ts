import type { ISeat } from './seat-layout'
import type { ITrip } from './trip'

export interface IBooking {
    bookingId: string
    bookingCode: string
    userId: string
    tripId: string
    trip: ITrip
    totalAmount: number
    paymentMethod: EPaymentMethod
    status: EBookingStatus
    expiresAt: string | null
    createdAt: string
    seats: IBookingSeat[]
}

export interface IBookingSeat {
    bookingSeatId: string
    bookingId: string
    seatId: string
    seat: ISeat
    price: number
}

export enum EBookingStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    RESERVED = 'RESERVED',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    COMPLETED = 'COMPLETED',
}

export enum EPaymentMethod {
    ONLINE = 'ONLINE',
    PAY_ON_BOARD = 'PAY_ON_BOARD',
}

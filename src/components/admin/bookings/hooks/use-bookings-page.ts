import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminBookings } from 'services/admins/booking.service'
import type { IBooking } from 'types/booking'

export type BookingStatus = 'all' | 'confirmed' | 'cancelled' | 'expired' | 'pending'
export type PaymentStatus = 'all' | 'paid' | 'unpaid' | 'refunded'
export type PaymentMethod = 'all' | 'online' | 'pay_on_board'

export interface AdminBookingRow {
    id: string
    bookingCode: string
    tripId: string
    totalAmount: number
    status: 'pending_payment' | 'reserved' | 'confirmed' | 'cancelled' | 'expired' | 'completed'
    paymentMethod: 'online' | 'pay_on_board'
    paymentStatus: Exclude<PaymentStatus, 'all'>
    createdAt: string
    userEmail: string
    userPhone: string
    userName: string
    routeLabel: string
    companyName: string
    companyId: string
    departureTime: string
    seatCount: number
}

const PAGE_SIZE = 15

const readPaginationRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[]
    }

    if (!payload || typeof payload !== 'object') {
        return []
    }

    const value = payload as { data?: T[]; result?: T[] }

    if (Array.isArray(value.data)) {
        return value.data
    }

    if (Array.isArray(value.result)) {
        return value.result
    }

    return []
}

const normalizeBookingStatus = (status: unknown): AdminBookingRow['status'] => {
    const normalized = String(status ?? '').toLowerCase()

    if (normalized === 'pending') return 'pending_payment'
    if (normalized === 'pending_payment') return 'pending_payment'
    if (normalized === 'reserved') return 'reserved'
    if (normalized === 'confirmed') return 'confirmed'
    if (normalized === 'cancelled') return 'cancelled'
    if (normalized === 'expired') return 'expired'
    if (normalized === 'completed') return 'completed'

    return 'pending_payment'
}

const normalizePaymentMethod = (method: unknown): AdminBookingRow['paymentMethod'] => {
    const normalized = String(method ?? '').toLowerCase()
    if (normalized === 'pay_on_board') return 'pay_on_board'
    return 'online'
}

const normalizePaymentStatus = (booking: IBooking): AdminBookingRow['paymentStatus'] => {
    const paymentStatus = String((booking as unknown as { payment?: { status?: string } }).payment?.status ?? '').toUpperCase()

    if (paymentStatus === 'PAID' || paymentStatus === 'CONFIRMED_ON_BOARD') return 'paid'
    if (paymentStatus === 'REFUNDED') return 'refunded'

    const bookingStatus = normalizeBookingStatus(booking.status)
    if (bookingStatus === 'confirmed' || bookingStatus === 'completed') return 'paid'
    if (bookingStatus === 'cancelled') return 'refunded'

    return 'unpaid'
}

const toBookingRow = (booking: IBooking): AdminBookingRow => {
    const trip = (booking as unknown as { trip?: Record<string, unknown> }).trip
    const route = (trip?.route as Record<string, unknown> | undefined)
    const fromName =
        (route?.fromLocation as { name?: string } | undefined)?.name
        ?? (trip?.fromLocation as { name?: string } | undefined)?.name
        ?? ''
    const toName =
        (route?.toLocation as { name?: string } | undefined)?.name
        ?? (trip?.toLocation as { name?: string } | undefined)?.name
        ?? ''

    const user = (booking as unknown as { user?: Record<string, unknown> }).user
    const company = (trip?.busCompany as Record<string, unknown> | undefined)

    return {
        id: booking.bookingId,
        bookingCode: booking.bookingCode,
        tripId: booking.tripId,
        totalAmount: booking.totalAmount,
        status: normalizeBookingStatus(booking.status),
        paymentMethod: normalizePaymentMethod(booking.paymentMethod),
        paymentStatus: normalizePaymentStatus(booking),
        createdAt: booking.createdAt,
        userEmail:
            (user?.email as string | undefined)
            ?? (booking as unknown as { userEmail?: string }).userEmail
            ?? '',
        userPhone:
            (user?.phone as string | undefined)
            ?? (booking as unknown as { userPhone?: string }).userPhone
            ?? '',
        userName:
            (user?.fullName as string | undefined)
            ?? (user?.name as string | undefined)
            ?? (booking as unknown as { userName?: string }).userName
            ?? '',
        routeLabel: `${fromName || booking.tripId} → ${toName || booking.tripId}`,
        companyName:
            (company?.name as string | undefined)
            ?? (trip?.companyName as string | undefined)
            ?? '',
        companyId:
            (trip?.busCompanyId as string | undefined)
            ?? (booking as unknown as { companyId?: string }).companyId
            ?? '',
        departureTime:
            (trip?.departureTime as string | undefined)
            ?? booking.createdAt,
        seatCount: Array.isArray(booking.seats) ? booking.seats.length : 0,
    }
}

interface UseBookingsPageProps {
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    statusFilter: BookingStatus
    setStatusFilter: Dispatch<SetStateAction<BookingStatus>>
    paymentFilter: PaymentStatus
    setPaymentFilter: Dispatch<SetStateAction<PaymentStatus>>
    methodFilter: PaymentMethod
    setMethodFilter: Dispatch<SetStateAction<PaymentMethod>>
    dateFrom: string
    setDateFrom: Dispatch<SetStateAction<string>>
    dateTo: string
    setDateTo: Dispatch<SetStateAction<string>>
    page: number
    setPage: Dispatch<SetStateAction<number>>
}

export const useBookingsPage = ({ search, setSearch, statusFilter, setStatusFilter, paymentFilter, setPaymentFilter, methodFilter, setMethodFilter, dateFrom, setDateFrom, dateTo, setDateTo, page, setPage }: UseBookingsPageProps) => {
    const bookingsQuery = useQuery({
        queryKey: ['admin-bookings', 'list'],
        queryFn: () => getAdminBookings({ page: 1, limit: 1000 }),
    })

    const rows = useMemo(() => {
        const payload = bookingsQuery.data?.data
        const bookings = readPaginationRows<IBooking>(payload)
        return bookings.map(toBookingRow)
    }, [bookingsQuery.data])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        const normalizedStatusFilter = statusFilter === 'pending' ? 'pending_payment' : statusFilter

        return rows.filter((booking) => {
            const companyText = booking.companyName.toLowerCase()
            const userEmailText = booking.userEmail.toLowerCase()
            const routeText = booking.routeLabel.toLowerCase()

            if (
                q
                && !booking.bookingCode.toLowerCase().includes(q)
                && !routeText.includes(q)
                && !userEmailText.includes(q)
                && !companyText.includes(q)
            ) return false

            if (normalizedStatusFilter !== 'all' && booking.status !== normalizedStatusFilter) return false
            if (paymentFilter !== 'all' && booking.paymentStatus !== paymentFilter) return false
            if (methodFilter !== 'all' && booking.paymentMethod !== methodFilter) return false
            if (dateFrom && booking.createdAt < dateFrom) return false
            if (dateTo && booking.createdAt > `${dateTo}T23:59:59`) return false

            return true
        })
    }, [rows, search, statusFilter, paymentFilter, methodFilter, dateFrom, dateTo])

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const hasFilter = search || statusFilter !== 'all' || paymentFilter !== 'all' || methodFilter !== 'all' || dateFrom || dateTo

    const statCounts = useMemo(() => ({
        total: rows.length,
        confirmed: rows.filter((booking) => booking.status === 'confirmed' || booking.status === 'completed').length,
        cancelled: rows.filter((booking) => booking.status === 'cancelled').length,
        pending: rows.filter((booking) => booking.status === 'pending_payment' || booking.status === 'reserved').length,
    }), [rows])

    const handleSearch = (value: string) => { setSearch(value); setPage(1) }
    const handleStatusFilter = (value: BookingStatus) => { setStatusFilter(value); setPage(1) }
    const handlePaymentFilter = (value: PaymentStatus) => { setPaymentFilter(value); setPage(1) }
    const handleDateFrom = (value: string) => { setDateFrom(value); setPage(1) }
    const handleDateTo = (value: string) => { setDateTo(value); setPage(1) }

    const clearFilters = () => {
        setSearch(''); setStatusFilter('all'); setPaymentFilter('all'); setMethodFilter('all'); setDateFrom(''); setDateTo('')
        setPage(1)
    }

    return {
        filtered, paginated, totalPages, hasFilter, statCounts,
        handleSearch, handleStatusFilter, handlePaymentFilter, handleDateFrom, handleDateTo,
        clearFilters,
        isLoading: bookingsQuery.isLoading,
        isError: bookingsQuery.isError,
    }
}

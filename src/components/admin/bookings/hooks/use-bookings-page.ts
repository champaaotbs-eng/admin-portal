import { useMemo, Dispatch, SetStateAction } from 'react'
import { MOCK_BOOKINGS } from '@/data/mock-extended'

export type BookingStatus = 'all' | 'confirmed' | 'cancelled' | 'expired' | 'pending'
export type PaymentStatus = 'all' | 'paid' | 'unpaid' | 'refunded'
export type PaymentMethod = 'all' | 'vnpay' | 'momo' | 'zalopay' | 'cash'

const PAGE_SIZE = 15

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
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return MOCK_BOOKINGS.filter(b => {
            if (q && !b.bookingCode.toLowerCase().includes(q) && !b.routeLabel.toLowerCase().includes(q) && !(b.userEmail?.toLowerCase().includes(q)) && !(b.companyName?.toLowerCase().includes(q))) return false
            if (statusFilter !== 'all' && b.status !== statusFilter) return false
            if (paymentFilter !== 'all' && b.paymentStatus !== paymentFilter) return false
            if (dateFrom && b.createdAt < dateFrom) return false
            if (dateTo && b.createdAt > dateTo + 'T23:59:59') return false
            return true
        })
    }, [search, statusFilter, paymentFilter, methodFilter, dateFrom, dateTo])

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const hasFilter = search || statusFilter !== 'all' || paymentFilter !== 'all' || methodFilter !== 'all' || dateFrom || dateTo

    const statCounts = useMemo(() => ({
        total: MOCK_BOOKINGS.length,
        confirmed: MOCK_BOOKINGS.filter(b => b.status === 'confirmed' || b.status === 'completed').length,
        cancelled: MOCK_BOOKINGS.filter(b => b.status === 'cancelled').length,
        pending: MOCK_BOOKINGS.filter(b => b.status === 'pending_payment').length,
    }), [])

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
    }
}

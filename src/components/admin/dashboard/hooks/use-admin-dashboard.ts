import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Ticket, Building2, CalendarDays, DollarSign } from 'lucide-react'
import { formatVnd } from '@/utils/format'
import { getAdminBookings } from 'services/admins/booking.service'
import { getAllAdminBusCompanies } from 'services/admins/bus-company.service'
import { getRevenues } from 'services/admins/revenue.service'
import { getAdminSettlements } from 'services/admins/settlement.service'
import { getAdminTrips } from 'services/admins/trip.service'
import type { IBooking } from 'types/booking'
import type { ICompany } from 'types/company'
import type { IRevenue, ISettlement } from 'types/revenue'
import type { ITrip } from 'types/trip'

const BOOKING_COLORS: Record<string, string> = {
    confirmed: '#22c55e',
    completed: '#3b82f6',
    cancelled: '#ef4444',
    expired: '#f97316',
    pending_payment: '#eab308',
    reserved: '#8b5cf6',
}

interface DashboardBooking {
    id: string
    bookingCode: string
    routeLabel: string
    totalAmount: number
    status: string
    paymentStatus: string
    createdAt: string
}

interface DashboardSettlement {
    id: string
    companyName: string
    periodFrom: string
    totalNet: number
    bookingCount: number
}

interface DashboardDailyRevenue {
    date: string
    label: string
    gross: number
    commission: number
    bookings: number
}

const readPaginationRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[]
    }

    if (!payload || typeof payload !== 'object') {
        return []
    }

    const value = payload as { data?: T[]; result?: T[] }
    if (Array.isArray(value.data)) return value.data
    if (Array.isArray(value.result)) return value.result
    return []
}

const normalizeBookingStatus = (status: unknown) => {
    const normalized = String(status ?? '').toLowerCase()
    if (normalized === 'pending') return 'pending_payment'
    return normalized || 'pending_payment'
}

const normalizePaymentStatus = (booking: IBooking) => {
    const paymentStatus = String((booking as unknown as { payment?: { status?: string } }).payment?.status ?? '').toUpperCase()

    if (paymentStatus === 'PAID' || paymentStatus === 'CONFIRMED_ON_BOARD') return 'paid'
    if (paymentStatus === 'REFUNDED') return 'refunded'

    const status = normalizeBookingStatus(booking.status)
    if (status === 'confirmed' || status === 'completed') return 'completed'
    if (status === 'cancelled') return 'refunded'

    return 'pending'
}

const toDashboardBooking = (booking: IBooking): DashboardBooking => {
    const trip = (booking as unknown as { trip?: Record<string, unknown> }).trip
    const route = (trip?.route as Record<string, unknown> | undefined)
    const fromName =
        (route?.fromLocation as { name?: string } | undefined)?.name
        ?? (trip?.fromLocation as { name?: string } | undefined)?.name
        ?? booking.tripId
    const toName =
        (route?.toLocation as { name?: string } | undefined)?.name
        ?? (trip?.toLocation as { name?: string } | undefined)?.name
        ?? booking.tripId

    return {
        id: booking.bookingId,
        bookingCode: booking.bookingCode,
        routeLabel: `PICKUP: ${fromName}\nDROPOFF: ${toName}`,
        totalAmount: booking.totalAmount,
        status: normalizeBookingStatus(booking.status),
        paymentStatus: normalizePaymentStatus(booking),
        createdAt: booking.createdAt,
    }
}

export const useAdminDashboard = () => {
    const { t, i18n } = useTranslation('translation', { keyPrefix: 'pages.dashboard' })
    const { t: tCommon } = useTranslation()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const bookingsQuery = useQuery({
        queryKey: ['admin-dashboard', 'bookings'],
        queryFn: () => getAdminBookings({ page: 1, limit: 1000 }),
    })

    const revenuesQuery = useQuery({
        queryKey: ['admin-dashboard', 'revenues'],
        queryFn: () => getRevenues({ page: 1, limit: 1000 }),
    })

    const companiesQuery = useQuery({
        queryKey: ['admin-dashboard', 'companies'],
        queryFn: () => getAllAdminBusCompanies(),
    })

    const tripsQuery = useQuery({
        queryKey: ['admin-dashboard', 'trips'],
        queryFn: () => getAdminTrips({ page: 1, limit: 1000 }),
    })

    const settlementsQuery = useQuery({
        queryKey: ['admin-dashboard', 'settlements'],
        queryFn: () => getAdminSettlements({ page: 1, limit: 1000 }),
    })

    const bookings = useMemo(() => {
        const payload = bookingsQuery.data?.data
        return readPaginationRows<IBooking>(payload).map(toDashboardBooking)
    }, [bookingsQuery.data])

    const revenues = useMemo(() => {
        const payload = revenuesQuery.data?.data
        return readPaginationRows<IRevenue>(payload)
    }, [revenuesQuery.data])

    const companies = useMemo(() => {
        const payload = companiesQuery.data?.data
        return readPaginationRows<ICompany>(payload)
    }, [companiesQuery.data])

    const trips = useMemo(() => {
        const payload = tripsQuery.data?.data
        return readPaginationRows<ITrip>(payload)
    }, [tripsQuery.data])

    const settlements = useMemo(() => {
        const payload = settlementsQuery.data?.data
        return readPaginationRows<ISettlement>(payload)
    }, [settlementsQuery.data])

    const companyMap = useMemo(() => {
        return new Map(companies.map((company) => [company.busCompanyId, company.name]))
    }, [companies])

    const dailyRevenueSeries = useMemo(() => {
        const rows = new Map<string, DashboardDailyRevenue>()

        for (const revenue of revenues) {
            const date = revenue.createdAt.slice(0, 10)
            const current = rows.get(date) ?? {
                date,
                label: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                gross: 0,
                commission: 0,
                bookings: 0,
            }

            current.gross += revenue.grossAmount
            current.commission += revenue.commission
            current.bookings += 1

            rows.set(date, current)
        }

        return Array.from(rows.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-30)
    }, [revenues])

    const companyRevenueSeries = useMemo(() => {
        const rows = new Map<string, number>()

        for (const revenue of revenues) {
            rows.set(revenue.companyId, (rows.get(revenue.companyId) ?? 0) + revenue.netAmount)
        }

        return Array.from(rows.entries())
            .map(([companyId, value]) => ({
                label: companyMap.get(companyId) ?? companyId,
                value,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
    }, [revenues, companyMap])

    const todayBookings = useMemo(() =>
        bookings.filter((booking) => new Date(booking.createdAt) >= today), [bookings, today])

    const last7Days = useMemo(() => {
        const d = new Date(today)
        d.setDate(d.getDate() - 7)
        return bookings.filter((booking) => new Date(booking.createdAt) >= d)
    }, [bookings, today])

    const grossRevenue = useMemo(() =>
        dailyRevenueSeries.reduce((sum, item) => sum + item.gross, 0), [dailyRevenueSeries])

    const totalCommission = useMemo(() =>
        dailyRevenueSeries.reduce((sum, item) => sum + item.commission, 0), [dailyRevenueSeries])

    const activeCompanies = companies.filter((company) => company.status === 'ACTIVE').length

    const tripsToday = trips.filter((trip) => {
        const dep = new Date(trip.departureTime)
        return dep >= today && dep < new Date(today.getTime() + 86400000)
    }).length

    const bookingStatusCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        bookings.forEach((booking) => {
            counts[booking.status] = (counts[booking.status] ?? 0) + 1
        })
        return counts
    }, [bookings])

    const donutSegments = Object.entries(bookingStatusCounts).map(([key, val]) => ({
        label: tCommon(`status.${key}`, { defaultValue: key }),
        value: val,
        color: BOOKING_COLORS[key] ?? '#94a3b8',
    }))

    const pendingSettlements = useMemo(() => settlements
        .filter((settlement) => String(settlement.status).toLowerCase() !== 'paid')
        .map((settlement): DashboardSettlement => ({
            id: settlement.settlementId,
            companyName: companyMap.get(settlement.companyId) ?? settlement.companyId,
            periodFrom: settlement.periodFrom,
            totalNet: settlement.totalNet,
            bookingCount: (settlement as unknown as { bookingCount?: number }).bookingCount ?? 0,
        })), [settlements, companyMap])

    const activeTripsCount = trips.filter((trip) => String(trip.status).toLowerCase() === 'active').length

    const recentBookings = useMemo(() => {
        return bookings
            .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 10)
    }, [bookings])

    const kpiCards = [
        {
            title: t('kpi_bookings_today'),
            value: todayBookings.length,
            sub: t('kpi_bookings_last7', { count: last7Days.length }),
            icon: Ticket,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            trend: +12.4,
            spark: dailyRevenueSeries.slice(-7).map((item) => item.bookings),
            sparkColor: '#3b82f6',
        },
        {
            title: t('kpi_platform_revenue'),
            value: formatVnd(grossRevenue),
            sub: t('kpi_commission', { amount: formatVnd(totalCommission) }),
            icon: DollarSign,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            trend: +8.2,
            spark: dailyRevenueSeries.slice(-7).map((item) => item.gross),
            sparkColor: '#10b981',
        },
        {
            title: t('kpi_active_companies'),
            value: activeCompanies,
            sub: t('kpi_total_count', { count: companies.length }),
            icon: Building2,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            trend: 0,
            spark: [3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7],
            sparkColor: '#f97316',
        },
        {
            title: t('kpi_trips_today'),
            value: tripsToday,
            sub: t('kpi_trips_running', { count: activeTripsCount }),
            icon: CalendarDays,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10',
            trend: +3.1,
            spark: [18, 22, 18, 25, 20, 24, tripsToday],
            sparkColor: '#8b5cf6',
        },
    ]

    return {
        t,
        tCommon,
        kpiCards,
        donutSegments,
        pendingSettlements,
        recentBookings,
        dailyRevenueSeries,
        companyRevenueSeries,
        BOOKING_COLORS,
        isLoading:
            bookingsQuery.isLoading
            || revenuesQuery.isLoading
            || companiesQuery.isLoading
            || tripsQuery.isLoading
            || settlementsQuery.isLoading,
        isError:
            bookingsQuery.isError
            || revenuesQuery.isError
            || companiesQuery.isError
            || tripsQuery.isError
            || settlementsQuery.isError,
    }
}

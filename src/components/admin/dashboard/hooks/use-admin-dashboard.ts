import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Ticket, Building2, CalendarDays, DollarSign } from 'lucide-react'
import { formatVnd } from '@/utils/format'
import {
    MOCK_DAILY_REVENUES,
    MOCK_BOOKINGS,
    MOCK_COMPANY_REVENUE,
    MOCK_TRIPS_EXTENDED,
    MOCK_SETTLEMENTS,
} from '@/data/mock-extended'
import { MOCK_COMPANIES } from '@/data/mock'

const BOOKING_COLORS: Record<string, string> = {
    confirmed: '#22c55e',
    completed: '#3b82f6',
    cancelled: '#ef4444',
    expired: '#f97316',
    pending_payment: '#eab308',
    reserved: '#8b5cf6',
}

export const useAdminDashboard = () => {
    const { t, i18n } = useTranslation('translation', { keyPrefix: 'pages.dashboard' })
    const { t: tCommon } = useTranslation()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayBookings = useMemo(() =>
        MOCK_BOOKINGS.filter(b => new Date(b.createdAt) >= today), [])

    const last7Days = useMemo(() => {
        const d = new Date(today)
        d.setDate(d.getDate() - 7)
        return MOCK_BOOKINGS.filter(b => new Date(b.createdAt) >= d)
    }, [])

    const grossRevenue = useMemo(() =>
        MOCK_DAILY_REVENUES.slice(-30).reduce((s, d) => s + d.gross, 0), [])

    const totalCommission = useMemo(() =>
        MOCK_DAILY_REVENUES.slice(-30).reduce((s, d) => s + d.commission, 0), [])

    const activeCompanies = MOCK_COMPANIES.filter(c => c.isActive).length

    const tripsToday = MOCK_TRIPS_EXTENDED.filter(t => {
        const dep = new Date(t.departureTime)
        return dep >= today && dep < new Date(today.getTime() + 86400000)
    }).length

    const bookingStatusCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        MOCK_BOOKINGS.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1 })
        return counts
    }, [])

    const donutSegments = Object.entries(bookingStatusCounts).map(([key, val]) => ({
        label: tCommon(`status.${key}`, { defaultValue: key }),
        value: val,
        color: BOOKING_COLORS[key] ?? '#94a3b8',
    }))

    const pendingSettlements = MOCK_SETTLEMENTS.filter(s => s.status === 'pending')
    const activeTripsCount = MOCK_TRIPS_EXTENDED.filter(trip => trip.status === 'active').length

    const kpiCards = [
        {
            title: t('kpi_bookings_today'),
            value: todayBookings.length,
            sub: t('kpi_bookings_last7', { count: last7Days.length }),
            icon: Ticket,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            trend: +12.4,
            spark: MOCK_DAILY_REVENUES.slice(-7).map(d => d.bookings),
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
            spark: MOCK_DAILY_REVENUES.slice(-7).map(d => d.gross),
            sparkColor: '#10b981',
        },
        {
            title: t('kpi_active_companies'),
            value: activeCompanies,
            sub: t('kpi_total_count', { count: MOCK_COMPANIES.length }),
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
        BOOKING_COLORS,
        MOCK_DAILY_REVENUES,
        MOCK_BOOKINGS,
        MOCK_COMPANY_REVENUE,
    }
}

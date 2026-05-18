import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Ticket, Building2, CalendarDays, DollarSign } from 'lucide-react'
import { formatVnd } from '@/utils/format'
import { getAdminDashboard } from '@/services/admins/dashboard.service'

const BOOKING_COLORS: Record<string, string> = {
    confirmed: '#22c55e',
    completed: '#3b82f6',
    cancelled: '#ef4444',
    expired: '#f97316',
    pending_payment: '#eab308',
    reserved: '#8b5cf6',
}

export const useAdminDashboard = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.dashboard' })
    const { t: tCommon } = useTranslation()

    const dashboardQuery = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: () => getAdminDashboard(),
        select: (res) => res.data ?? res,
    })

    const dashboard = dashboardQuery.data

    const donutSegments = useMemo(() => Object.entries(dashboard?.bookingStatusCounts ?? {}).map(([key, value]) => ({
        label: tCommon(`status.${key}`, { defaultValue: key }),
        value,
        color: BOOKING_COLORS[key] ?? '#94a3b8',
    })), [dashboard?.bookingStatusCounts, tCommon])

    const kpiCards = useMemo(() => {
        const metrics = dashboard?.metrics
        const revenueSeries = dashboard?.dailyRevenueSeries ?? []
        return [
            {
                title: t('kpi_bookings_today'),
                value: metrics?.bookingsToday ?? 0,
                sub: t('kpi_bookings_last7', { count: metrics?.bookingsLast7Days ?? 0 }),
                icon: Ticket,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                trend: 0,
                spark: revenueSeries.slice(-7).map((item) => item.bookings),
                sparkColor: '#3b82f6',
            },
            {
                title: t('kpi_platform_revenue'),
                value: formatVnd(metrics?.grossRevenue ?? 0),
                sub: t('kpi_commission', { amount: formatVnd(metrics?.totalCommission ?? 0) }),
                icon: DollarSign,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                trend: 0,
                spark: revenueSeries.slice(-7).map((item) => item.gross),
                sparkColor: '#10b981',
            },
            {
                title: t('kpi_active_companies'),
                value: metrics?.activeCompanies ?? 0,
                sub: t('kpi_total_count', { count: metrics?.totalCompanies ?? 0 }),
                icon: Building2,
                color: 'text-orange-500',
                bg: 'bg-orange-500/10',
                trend: 0,
                spark: dashboard?.companyRevenueSeries.slice(0, 7).map((item) => item.value) ?? [],
                sparkColor: '#f97316',
            },
            {
                title: t('kpi_trips_today'),
                value: metrics?.tripsToday ?? 0,
                sub: t('kpi_trips_running', { count: metrics?.activeTrips ?? 0 }),
                icon: CalendarDays,
                color: 'text-violet-500',
                bg: 'bg-violet-500/10',
                trend: 0,
                spark: revenueSeries.slice(-7).map((item) => item.bookings),
                sparkColor: '#8b5cf6',
            },
        ]
    }, [dashboard, t])

    return {
        t,
        tCommon,
        kpiCards,
        donutSegments,
        pendingSettlements: dashboard?.pendingSettlements ?? [],
        recentBookings: dashboard?.recentBookings ?? [],
        dailyRevenueSeries: dashboard?.dailyRevenueSeries ?? [],
        companyRevenueSeries: dashboard?.companyRevenueSeries ?? [],
        BOOKING_COLORS,
        isLoading: dashboardQuery.isLoading,
        isError: dashboardQuery.isError,
    }
}

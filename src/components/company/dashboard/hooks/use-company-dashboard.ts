import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getCompanyDashboard } from '@/services/company/dashboard.service'

export const useCompanyDashboard = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.dashboard' })
    const dashboardQuery = useQuery({
        queryKey: ['company-dashboard'],
        queryFn: () => getCompanyDashboard(),
        select: (res) => res.data ?? res,
    })

    const dashboard = dashboardQuery.data

    const donutData = useMemo(() => ([
        { label: t('fleet_active', { defaultValue: 'Fleet active' }), value: dashboard?.fleetStatusCounts.active ?? 0, color: '#22c55e' },
        { label: t('fleet_in_progress', { defaultValue: 'In progress' }), value: dashboard?.fleetStatusCounts.in_progress ?? 0, color: '#3b82f6' },
        { label: t('fleet_maintenance', { defaultValue: 'Maintenance' }), value: dashboard?.fleetStatusCounts.maintenance ?? 0, color: '#f97316' },
        { label: t('fleet_retired', { defaultValue: 'Retired' }), value: dashboard?.fleetStatusCounts.retired ?? 0, color: '#94a3b8' },
    ]), [dashboard?.fleetStatusCounts, t])

    return {
        dashboard,
        weekRevenue: dashboard?.metrics.weekRevenue ?? 0,
        monthRevenue: dashboard?.metrics.monthRevenue ?? 0,
        confirmedToday: dashboard?.metrics.bookingsToday ?? 0,
        totalBuses: dashboard?.metrics.totalBuses ?? 0,
        donutData,
        routeRevenueSeries: dashboard?.routeRevenueSeries ?? [],
        dailyRevenueSeries: dashboard?.dailyRevenueSeries ?? [],
        recentTrips: dashboard?.recentTrips ?? [],
        isLoading: dashboardQuery.isLoading,
        isError: dashboardQuery.isError,
    }
}

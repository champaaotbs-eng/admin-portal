import { Bus, Ticket, DollarSign, TrendingUp, MapPin, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, DonutChart, HorizontalBarChart } from '@/components/ui/charts'
import { formatDateTime, formatVnd } from '@/utils/format'
import { useCompanyDashboard } from './hooks/use-company-dashboard'

const STATUS_COLORS: Record<string, string> = {
    completed: 'text-green-600 bg-green-50',
    in_progress: 'text-blue-600 bg-blue-50',
    scheduled: 'text-orange-600 bg-orange-50',
    cancelled: 'text-red-600 bg-red-50',
}

export const CompanyDashboardPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.dashboard' })
    const { t: tTrips } = useTranslation('translation', { keyPrefix: 'pages.trips' })
    const { t: tFleet } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tCommon } = useTranslation()
    const {
        weekRevenue,
        monthRevenue,
        confirmedToday,
        totalBuses,
        donutData,
        routeRevenueSeries,
        dailyRevenueSeries,
        recentTrips,
        isLoading,
        isError,
    } = useCompanyDashboard()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: t('kpi_platform_revenue'), value: formatVnd(weekRevenue), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
                    { label: t('revenue_title'), value: formatVnd(monthRevenue), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', trend: '+8%' },
                    { label: t('kpi_bookings_today'), value: confirmedToday, icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+5%' },
                    { label: tFleet('stats.total'), value: totalBuses, icon: Bus, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: null },
                ].map(kpi => {
                    const Icon = kpi.icon
                    return (
                        <Card key={kpi.label}>
                            <CardContent className="flex items-start gap-3 p-4">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                    {kpi.trend && (
                                        <p className="text-xs font-medium text-green-600">{kpi.trend} {tCommon('common.prev')}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Bus className="h-4 w-4 text-primary" /> {tFleet('table.status')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DonutChart segments={donutData} size={160} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-4 w-4 text-primary" /> {t('chart_routes_revenue', { defaultValue: 'Revenue by route' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p className="pb-2 text-sm text-muted-foreground">{tCommon('common.loading')}</p> : null}
                        {isError ? <p className="pb-2 text-sm text-destructive">{tCommon('common.error')}</p> : null}
                        <HorizontalBarChart data={routeRevenueSeries} formatValue={formatVnd} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('chart_platform_revenue')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p className="pb-2 text-sm text-muted-foreground">{tCommon('common.loading')}</p> : null}
                    {isError ? <p className="pb-2 text-sm text-destructive">{tCommon('common.error')}</p> : null}
                    <LineChart
                        data={dailyRevenueSeries as unknown as Record<string, string | number>[]}
                        series={[
                            { key: 'gross', label: t('chart_gross', { defaultValue: 'Gross' }), color: '#3b82f6' },
                            { key: 'net', label: t('chart_net', { defaultValue: 'Net' }), color: '#22c55e' },
                        ]}
                        height={220}
                        labelKey="label"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-primary" /> {t('kpi_trips_today')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="pb-2 text-left font-medium text-muted-foreground">{tTrips('table.route')}</th>
                                    <th className="pb-2 text-left font-medium text-muted-foreground">{tTrips('table.departure')}</th>
                                    <th className="pb-2 text-center font-medium text-muted-foreground">{tTrips('table.seats_sold')}</th>
                                    <th className="pb-2 text-center font-medium text-muted-foreground">{t('col_tickets')}</th>
                                    <th className="pb-2 text-center font-medium text-muted-foreground">%</th>
                                    <th className="pb-2 text-left font-medium text-muted-foreground">{tTrips('table.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTrips.map(trip => (
                                    <tr key={trip.id} className="border-b border-border last:border-0">
                                        <td className="py-2.5 font-medium">{trip.route}</td>
                                        <td className="py-2.5 text-xs text-muted-foreground">{formatDateTime(trip.departureTime)}</td>
                                        <td className="py-2.5 text-center">{trip.seats}</td>
                                        <td className="py-2.5 text-center">{trip.sold}</td>
                                        <td className="py-2.5 text-center">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${trip.seats > 0 ? (trip.sold / trip.seats) * 100 : 0}%` }} />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {trip.seats > 0 ? Math.round((trip.sold / trip.seats) * 100) : 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5">
                                            <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[trip.status] ?? ''}`}>
                                                {trip.status === 'completed'
                                                    ? tCommon('status.completed')
                                                    : trip.status === 'in_progress'
                                                        ? tCommon('status.in_progress')
                                                        : trip.status === 'cancelled'
                                                            ? tCommon('status.cancelled')
                                                            : tCommon('status.scheduled')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentTrips.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-6 text-center text-muted-foreground">
                                            {tCommon('common.no_results')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

import {
    TrendingUp, CalendarDays, ArrowUpRight, Clock,
    CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, DonutChart, HorizontalBarChart, Heatmap, TrendBadge, Sparkline } from '@/components/ui/charts'
import { formatDate, formatVnd } from '@/utils/format'
import { useAdminDashboard } from './hooks/use-admin-dashboard'

// Generate heatmap data: 7 days × 24 hours
const HEATMAP_DATA = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
        const peak = (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21)
        const wknd = day === 0 || day === 6
        const base = peak ? 12 : hour < 5 || hour > 22 ? 1 : 5
        return Math.floor(base * (wknd ? 1.4 : 1) * (0.6 + Math.random() * 0.8))
    })
)

export const AdminDashboardPage = () => {
    const {
        t,
        tCommon,
        kpiCards,
        donutSegments,
        pendingSettlements,
        recentBookings,
        dailyRevenueSeries,
        companyRevenueSeries,
        BOOKING_COLORS,
        isLoading,
        isError,
    } = useAdminDashboard()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(new Date())}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((c) => {
                    const Icon = c.icon
                    return (
                        <Card key={c.title} className="overflow-hidden">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
                                        <Icon className={`h-4.5 w-4.5 ${c.color}`} />
                                    </span>
                                    <TrendBadge value={c.trend} />
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">{c.title}</p>
                                        <p className="text-2xl font-bold leading-none">{c.value}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                                    </div>
                                    <Sparkline data={c.spark} color={c.sparkColor} />
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Revenue Line Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{t('chart_platform_revenue')}</CardTitle>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> {t('chart_gross')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> {t('chart_commission')}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {isLoading ? <p className="text-sm text-muted-foreground pb-2">{tCommon('common.loading')}</p> : null}
                        {isError ? <p className="text-sm text-destructive pb-2">{tCommon('common.error')}</p> : null}
                        <LineChart
                            data={dailyRevenueSeries as unknown as Record<string, string | number>[]}
                            series={[
                                { key: 'gross', color: '#3b82f6', label: t('chart_gross') },
                                { key: 'commission', color: '#10b981', label: t('chart_commission') },
                            ]}
                            height={200}
                        />
                    </CardContent>
                </Card>

                {/* Booking Status Donut */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t('chart_booking_status')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DonutChart segments={donutSegments} size={120} />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top 10 companies */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            {t('chart_top_companies')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HorizontalBarChart
                            data={companyRevenueSeries}
                            formatValue={formatVnd}
                            color="#f97316"
                        />
                    </CardContent>
                </Card>

                {/* Heatmap */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-violet-500" />
                            {t('chart_booking_heatmap')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Heatmap data={HEATMAP_DATA} />
                        <div className="flex items-center gap-2 mt-3 justify-end text-xs text-muted-foreground">
                            <span>{t('heatmap_low')}</span>
                            <div className="flex gap-0.5">
                                {[0.05, 0.25, 0.5, 0.75, 0.95].map(o => (
                                    <div key={o} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(59,130,246,${o})` }} />
                                ))}
                            </div>
                            <span>{t('heatmap_high')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Tables */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Latest bookings */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base">{t('recent_bookings')}</CardTitle>
                        <a href="/admin/bookings" className="text-xs text-primary hover:underline flex items-center gap-1">
                            {t('view_all')} <ArrowUpRight className="h-3 w-3" />
                        </a>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('col_ticket_code')}</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('col_route')}</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('col_amount')}</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('col_status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/20 last:border-0">
                                            <td className="px-4 py-2 font-mono font-medium text-primary">{booking.bookingCode}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{booking.routeLabel}</td>
                                            <td className="px-4 py-2 font-medium">{formatVnd(booking.totalAmount)}</td>
                                            <td className="px-4 py-2">
                                                <span className="inline-flex items-center gap-1 text-xs">
                                                    {booking.status === 'confirmed' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                                    {booking.status === 'cancelled' && <XCircle className="h-3 w-3 text-red-500" />}
                                                    {booking.status === 'pending_payment' && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                                                    <span style={{ color: BOOKING_COLORS[booking.status] ?? '#94a3b8' }}>
                                                        {tCommon(`status.${booking.status}`, { defaultValue: booking.status })}
                                                    </span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentBookings.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                                                {tCommon('common.no_results')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending settlements */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            {t('pending_settlements')}
                        </CardTitle>
                        <a href="/admin/revenue" className="text-xs text-primary hover:underline flex items-center gap-1">
                            {t('view_all')} <ArrowUpRight className="h-3 w-3" />
                        </a>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('col_company')}</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('col_period')}</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('col_payable')}</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">{t('col_tickets')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingSettlements.map(s => (
                                        <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 last:border-0">
                                            <td className="px-4 py-2 font-medium">{s.companyName}</td>
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {s.periodFrom.slice(0, 7)}
                                            </td>
                                            <td className="px-4 py-2 font-medium text-orange-600">
                                                {formatVnd(s.totalNet)}
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground">{s.bookingCount}</td>
                                        </tr>
                                    ))}
                                    {pendingSettlements.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                                                {t('no_pending_settlements')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


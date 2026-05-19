import { useMemo, useState } from 'react'
import { DollarSign, TrendingUp, Wallet, CalendarDays, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LineChart } from '@/components/ui/charts'
import { PaginatedTable } from '@/components/shared/pagination-table'
import { RevenueDetailModal } from '@/components/shared/revenue-detail-modal'
import { formatDate, formatVnd } from '@/utils/format'
import { getRevenueDetail, getRevenues, getRevenueStats } from 'services/company/revenue.service'
import type { IRevenue } from 'types/revenue'
import { CompanySettlementsTab } from './components/company-settlements-tab'

const PAGE_SIZE = 20

const readRows = <T,>(payload: unknown): T[] => {
    if (!payload || typeof payload !== 'object') return []
    const v = payload as { result?: T[]; data?: T[] }
    return Array.isArray(v.result) ? v.result : Array.isArray(v.data) ? v.data : []
}

const readMeta = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return null
    return (payload as { meta?: { totalPages: number; totalItems: number } }).meta ?? null
}

export function CompanyRevenuePage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.revenue' })
    const { t: tCommon } = useTranslation()

    const [page, setPage] = useState(1)
    const [selectedRevenue, setSelectedRevenue] = useState<IRevenue | null>(null)
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    const { data, isLoading, isError } = useQuery({
        queryKey: ['company-revenues', page, dateFrom, dateTo],
        queryFn: () => getRevenues({ page, limit: PAGE_SIZE, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
    })

    const statsQuery = useQuery({
        queryKey: ['company-revenues', 'stats', dateFrom, dateTo],
        queryFn: () => getRevenueStats(dateFrom || undefined, dateTo || undefined),
    })

    const rawPayload = (data as any)?.data ?? data
    const revenues = useMemo(() => readRows<IRevenue>(rawPayload), [rawPayload])
    const meta = useMemo(() => readMeta(rawPayload), [rawPayload])

    const statsData = (statsQuery.data as any)?.data ?? statsQuery.data

    const dailyRevenues = useMemo(() => (statsData?.daily ?? []).map((d: { date: string; gross: number; commission: number; net: number }) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    })), [statsData])

    const hasFilter = dateFrom || dateTo
    const clearFilters = () => { setDateFrom(''); setDateTo(''); setPage(1) }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('company_title')}</h1>
                <p className="text-sm text-muted-foreground">{t('company_description')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: t('stats.total_gross'), value: formatVnd(statsData?.totalGross ?? 0), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: t('stats.commission'), value: formatVnd(statsData?.totalCommission ?? 0), icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-500/10' },
                    { label: t('stats.net'), value: formatVnd(statsData?.totalNet ?? 0), icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map(kpi => {
                    const Icon = kpi.icon
                    return (
                        <Card key={kpi.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                    <p className="text-xl font-bold">{kpi.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('chart_30d')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isError && <p className="text-sm text-destructive">{tCommon('common.error')}</p>}
                    <LineChart
                        data={dailyRevenues as unknown as Record<string, string | number>[]}
                        series={[
                            { key: 'gross', label: 'Gross', color: '#3b82f6' },
                            { key: 'commission', label: 'Hoa hong', color: '#ef4444' },
                            { key: 'net', label: 'Net', color: '#22c55e' },
                        ]}
                        height={220}
                        labelKey="label"
                    />
                </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" />
                <span className="text-muted-foreground">—</span>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" />
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" /> {tCommon('common.clear_filters')}
                    </Button>
                )}
            </div>

            <Tabs defaultValue="transactions">
                <TabsList>
                    <TabsTrigger value="transactions">{t('tab_revenue')}</TabsTrigger>
                    <TabsTrigger value="settlements">{t('tab_settlements')}</TabsTrigger>
                </TabsList>
                <TabsContent value="transactions">
                    <PaginatedTable
                        data={revenues}
                        rowKey={r => r.id}
                        isLoading={isLoading}
                        emptyMessage={t('no_data')}
                        pagination={{
                            currentPage: page,
                            totalPages: meta?.totalPages ?? 1,
                            totalItems: statsData?.totalCount ?? meta?.totalItems ?? 0,
                            pageSize: PAGE_SIZE,
                            onPageChange: setPage,
                        }}
                        columns={[
                            { id: 'booking', header: t('table.booking_code'), renderCell: r => <span className="font-mono text-xs text-muted-foreground">{r.bookingCode ?? r.bookingId}</span> },
                            { id: 'time', header: t('table.time'), renderCell: r => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span> },
                            { id: 'gross', header: t('table.gross'), headerClassName: 'text-right', cellClassName: 'text-right', renderCell: r => formatVnd(r.grossAmount) },
                            {
                                id: 'rate', header: t('table.fee_pct'), headerClassName: 'text-right', cellClassName: 'text-right text-muted-foreground',
                                renderCell: r => `${r.grossAmount > 0 ? Number(((r.commission / r.grossAmount) * 100).toFixed(2)) : 0}%`
                            },
                            { id: 'commission', header: t('table.commission'), headerClassName: 'text-right', cellClassName: 'text-right text-red-500', renderCell: r => `-${formatVnd(r.commission)}` },
                            { id: 'net', header: t('table.net'), headerClassName: 'text-right', cellClassName: 'text-right font-semibold text-green-600', renderCell: r => formatVnd(r.netAmount) },
                            { id: 'actions', header: tCommon('common.actions'), renderCell: r => <Button variant="outline" size="sm" onClick={() => setSelectedRevenue(r)}>{tCommon('common.view')}</Button> },
                        ]}
                    />
                    {selectedRevenue && (
                        <RevenueDetailModal
                            revenueId={selectedRevenue.id}
                            initialRevenue={selectedRevenue}
                            loadRevenue={getRevenueDetail}
                            onClose={() => setSelectedRevenue(null)}
                        />
                    )}
                </TabsContent>
                <TabsContent value="settlements">
                    <CompanySettlementsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}

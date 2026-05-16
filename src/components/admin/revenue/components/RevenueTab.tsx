import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, CalendarDays, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart } from '@/components/ui/charts'
import { PaginatedTable } from '@/components/shared/pagination-table'
import { formatDate, formatVnd } from '@/utils/format'
import { useRevenueTab } from '../hooks/use-revenue-tab'

export const RevenueTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.revenue' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [companyId, setCompanyId] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const {
        filtered, totals, companyMap, companies, clearFilters, hasFilter, dailyRevenues,
        page, setPage, totalPages, totalItems, pageSize,
        isLoading, isError,
    } = useRevenueTab({ search, companyId, dateFrom, dateTo, setSearch, setCompanyId, setDateFrom, setDateTo })

    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
                {[
                    { label: t('stats.total_gross'), value: formatVnd(totals.gross), color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: t('stats.commission'), value: formatVnd(totals.commission), color: 'text-red-500', bg: 'bg-red-500/10' },
                    { label: t('stats.net'), value: formatVnd(totals.net), color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t('total_count', { count: totalItems })}</p>
                        </CardContent>
                    </Card>
                ))}
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
                        height={240}
                        labelKey="label"
                    />
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <select
                    value={companyId}
                    onChange={e => { setCompanyId(e.target.value); setPage(1) }}
                    className="min-w-52 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="">{t('filter_all_companies')}</option>
                    {companies.map((company) => (
                        <option key={company.busCompanyId} value={company.busCompanyId}>
                            {company.name}
                        </option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" />
                    <span className="text-muted-foreground">—</span>
                    <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" />
                </div>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" /> {tCommon('common.clear_filters')}
                    </Button>
                )}
            </div>

            <PaginatedTable
                data={filtered}
                rowKey={r => r.id}
                isLoading={isLoading}
                emptyMessage={t('no_data')}
                pagination={{ currentPage: page, totalPages, totalItems, pageSize, onPageChange: setPage }}
                columns={[
                    { id: 'company', header: t('table.company'), renderCell: r => <span className="truncate max-w-36 block">{companyMap.get(r.companyId) ?? r.companyId}</span> },
                    { id: 'booking', header: t('table.booking_code'), renderCell: r => <span className="font-mono text-xs text-muted-foreground">{r.bookingId}</span> },
                    { id: 'time', header: t('table.time'), renderCell: r => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span> },
                    { id: 'gross', header: t('table.gross'), headerClassName: 'text-right', cellClassName: 'text-right', renderCell: r => formatVnd(r.grossAmount) },
                    { id: 'rate', header: t('table.fee_pct'), headerClassName: 'text-right', cellClassName: 'text-right text-muted-foreground', renderCell: r => `${r.commissionRate}%` },
                    { id: 'commission', header: t('table.commission'), headerClassName: 'text-right', cellClassName: 'text-right text-red-500', renderCell: r => formatVnd(r.commissionAmount) },
                    { id: 'net', header: t('table.net'), headerClassName: 'text-right', cellClassName: 'text-right font-medium text-green-600', renderCell: r => formatVnd(r.netAmount) },
                ]}
            />
        </div>
    )
}

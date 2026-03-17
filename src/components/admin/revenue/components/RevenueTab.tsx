import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, CalendarDays, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart } from '@/components/ui/charts'
import { formatDate, formatVnd } from '@/utils/format'
import { useRevenueTab } from '../hooks/use-revenue-tab'

export const RevenueTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.revenue' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const {
        filtered, totals, companyMap, clearFilters, hasFilter, dailyRevenues,
    } = useRevenueTab({ search, dateFrom, dateTo, setSearch, setDateFrom, setDateTo })

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
                            <p className="text-xs text-muted-foreground mt-1">{t('total_count', { count: filtered.length })}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('chart_30d')}</CardTitle>
                </CardHeader>
                <CardContent>
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
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" />
                    <span className="text-muted-foreground">—</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" />
                </div>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" /> {tCommon('common.clear_filters')}
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.company')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.booking_code')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.time')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('table.gross')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('table.fee_pct')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('table.commission')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('table.net')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 50).map(r => (
                            <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium text-xs truncate max-w-36">{companyMap.get(r.companyId) ?? r.companyId}</td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.bookingId}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.createdAt)}</td>
                                <td className="px-4 py-3 text-right">{formatVnd(r.grossAmount)}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground">{r.commissionRate}%</td>
                                <td className="px-4 py-3 text-right text-red-500">{formatVnd(r.commissionAmount)}</td>
                                <td className="px-4 py-3 text-right font-medium text-green-600">{formatVnd(r.netAmount)}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">{t('no_data')}</td>
                            </tr>
                        )}
                    </tbody>
                    {filtered.length > 0 && (
                        <tfoot className="bg-muted/50 font-semibold">
                            <tr className="border-t-2 border-border">
                                <td colSpan={3} className="px-4 py-3 text-sm">{t('total_count', { count: filtered.length })}</td>
                                <td className="px-4 py-3 text-right">{formatVnd(totals.gross)}</td>
                                <td />
                                <td className="px-4 py-3 text-right text-red-500">{formatVnd(totals.commission)}</td>
                                <td className="px-4 py-3 text-right text-green-600">{formatVnd(totals.net)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    )
}

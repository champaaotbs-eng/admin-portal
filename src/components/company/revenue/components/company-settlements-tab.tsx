import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays, CheckCircle2, Clock, DollarSign, FileText, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PaginatedTable } from '@/components/shared/pagination-table'
import { formatDate, formatVnd } from '@/utils/format'
import { useCompanySettlementsTab, type CompanySettlementStatus } from '../hooks/use-company-settlements-tab'

export const CompanySettlementsTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.revenue' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [statusFilter, setStatusFilter] = useState<CompanySettlementStatus>('all')

    const {
        settlements,
        filtered,
        clearFilters,
        hasFilter,
        page,
        setPage,
        totalPages,
        totalItems,
        pageSize,
        isLoading,
        isError,
    } = useCompanySettlementsTab({
        search,
        dateFrom,
        dateTo,
        statusFilter,
        setSearch,
        setDateFrom,
        setDateTo,
        setStatusFilter,
    })

    const summaryItems = [
        {
            label: t('filter_pending'),
            value: settlements.filter((settlement) => settlement.status === 'pending').length,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            icon: Clock,
        },
        {
            label: t('filter_paid'),
            value: settlements.filter((settlement) => settlement.status === 'paid').length,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            icon: CheckCircle2,
        },
        {
            label: t('stats.pending_settlement'),
            value: formatVnd(
                settlements
                    .filter((settlement) => settlement.status === 'pending')
                    .reduce((sum, settlement) => sum + settlement.totalNet, 0),
            ),
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            icon: DollarSign,
        },
    ]

    const statusOptions: [CompanySettlementStatus, string][] = [
        ['all', t('filter_all')],
        ['pending', t('filter_pending')],
        ['paid', t('filter_paid')],
    ]

    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
                {summaryItems.map((item) => {
                    const Icon = item.icon

                    return (
                        <Card key={item.label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                                    <Icon className={`h-4 w-4 ${item.color}`} />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">{item.label}</p>
                                    <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => {
                            setDateFrom(event.target.value)
                            setPage(1)
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => {
                            setDateTo(event.target.value)
                            setPage(1)
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                </div>
                <div className="flex overflow-hidden rounded-md border border-border text-sm">
                    {statusOptions.map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => {
                                setStatusFilter(value)
                                setPage(1)
                            }}
                            className={`px-3 py-2 ${statusFilter === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {hasFilter ? (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" /> {tCommon('common.clear_filters')}
                    </Button>
                ) : null}
            </div>

            {isError ? <p className="text-sm text-destructive">{tCommon('common.error')}</p> : null}

            <PaginatedTable
                data={filtered}
                rowKey={(settlement) => settlement.id}
                isLoading={isLoading}
                emptyMessage={t('no_settlements')}
                pagination={{ currentPage: page, totalPages, totalItems, pageSize, onPageChange: setPage }}
                columns={[
                    {
                        id: 'code',
                        header: t('settlements_table.code'),
                        renderCell: (settlement) => (
                            <span className="font-mono text-xs text-muted-foreground">{settlement.referenceCode}</span>
                        ),
                    },
                    {
                        id: 'period',
                        header: t('settlements_table.period'),
                        renderCell: (settlement) => (
                            <span className="whitespace-nowrap text-xs text-muted-foreground">
                                {formatDate(settlement.periodFrom)} — {formatDate(settlement.periodTo)}
                            </span>
                        ),
                    },
                    {
                        id: 'gross',
                        header: t('settlements_table.gross'),
                        headerClassName: 'text-right',
                        cellClassName: 'text-right',
                        renderCell: (settlement) => formatVnd(settlement.totalGross),
                    },
                    {
                        id: 'commission',
                        header: t('settlements_table.commission'),
                        headerClassName: 'text-right',
                        cellClassName: 'text-right text-red-500',
                        renderCell: (settlement) => formatVnd(settlement.totalCommission),
                    },
                    {
                        id: 'net',
                        header: t('settlements_table.net'),
                        headerClassName: 'text-right',
                        cellClassName: 'text-right font-semibold text-green-600',
                        renderCell: (settlement) => formatVnd(settlement.totalNet),
                    },
                    {
                        id: 'bookings',
                        header: t('settlements_table.bookings'),
                        headerClassName: 'text-center',
                        cellClassName: 'text-center',
                        renderCell: (settlement) => settlement.bookingCount,
                    },
                    {
                        id: 'status',
                        header: t('settlements_table.status'),
                        renderCell: (settlement) => (
                            <Badge variant={settlement.status === 'paid' ? 'success' : 'warning'} className="text-xs">
                                {settlement.status === 'paid' ? t('filter_paid') : t('filter_pending')}
                            </Badge>
                        ),
                    },
                    {
                        id: 'actions',
                        header: '',
                        renderCell: () => (
                            <button className="p-1 text-muted-foreground hover:text-foreground" title={t('view_pdf')}>
                                <FileText className="h-4 w-4" />
                            </button>
                        ),
                    },
                ]}
            />
        </div>
    )
}

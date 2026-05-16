import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, CheckCircle2, Clock, DollarSign, FileText, CalendarDays, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { PaginatedTable } from '@/components/shared/pagination-table'
import { formatDate, formatVnd } from '@/utils/format'
import { useSettlementsTab } from '../hooks/use-settlements-tab'
import type { SettlementStatus } from '../hooks/use-settlements-tab'

export const SettlementsTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.revenue' })
    const { t: tCommon } = useTranslation()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedCompanyId, setSelectedCompanyId] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [statusFilter, setStatusFilter] = useState<SettlementStatus>('all')
    const [companyId, setCompanyId] = useState('')
    const [periodFrom, setPeriodFrom] = useState('')
    const [periodTo, setPeriodTo] = useState('')
    const {
        settlements,
        openDialog,
        closeDialog,
        filtered,
        companyMap,
        companies,
        clearFilters,
        hasFilter,
        page,
        setPage,
        totalPages,
        totalItems,
        pageSize,
        markPaid,
        createSettlement,
        isLoading,
        isError,
        isMarkingPaid,
        isCreatingSettlement,
    } = useSettlementsTab({
        dialogOpen,
        setDialogOpen,
        search,
        setSearch,
        companyId: selectedCompanyId,
        setCompanyId: setSelectedCompanyId,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        statusFilter,
        setStatusFilter,
    })

    useEffect(() => {
        if (!companyId && companies.length > 0) {
            setCompanyId(companies[0].busCompanyId)
        }
    }, [companies, companyId])

    const submitSettlement = async () => {
        if (!companyId || !periodFrom || !periodTo) {
            return
        }

        await createSettlement({
            companyId,
            periodFrom,
            periodTo,
        })

        setPeriodFrom('')
        setPeriodTo('')
    }

    const summaryItems = [
        { label: t('filter_pending'), value: settlements.filter(s => s.status === 'pending').length, color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Clock },
        { label: t('filter_paid'), value: settlements.filter(s => s.status === 'paid').length, color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 },
        { label: t('stats.pending_settlement'), value: formatVnd(settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.totalNet, 0)), color: 'text-blue-500', bg: 'bg-blue-500/10', icon: DollarSign },
    ]

    const statusOptions: [SettlementStatus, string][] = [
        ['all', t('filter_all')],
        ['pending', t('filter_pending')],
        ['paid', t('filter_paid')],
    ]

    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
                {summaryItems.map(s => {
                    const Icon = s.icon
                    return (
                        <Card key={s.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                                    <Icon className={`h-4 w-4 ${s.color}`} />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <select
                    value={selectedCompanyId}
                    onChange={(event) => { setSelectedCompanyId(event.target.value); setPage(1) }}
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
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => { setDateFrom(event.target.value); setPage(1) }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => { setDateTo(event.target.value); setPage(1) }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                </div>
                <div className="flex rounded-md border border-border overflow-hidden text-sm">
                    {statusOptions.map(([value, label]) => (
                        <button key={value} onClick={() => { setStatusFilter(value); setPage(1) }}
                            className={`px-3 py-2 ${statusFilter === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                            {label}
                        </button>
                    ))}
                </div>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" /> {tCommon('common.clear_filters')}
                    </Button>
                )}
                <Button size="sm" onClick={openDialog}>
                    <Plus className="h-4 w-4" /> {t('create_settlement')}
                </Button>
            </div>

            {isError ? <p className="text-sm text-destructive">{tCommon('common.error')}</p> : null}

            <PaginatedTable
                data={filtered}
                rowKey={s => s.id}
                isLoading={isLoading}
                emptyMessage={t('no_settlements')}
                pagination={{ currentPage: page, totalPages, totalItems, pageSize, onPageChange: setPage }}
                columns={[
                    { id: 'code', header: t('settlements_table.code'), renderCell: s => <span className="font-mono text-xs text-muted-foreground">{s.referenceCode}</span> },
                    { id: 'company', header: t('settlements_table.company'), renderCell: s => <span className="font-medium text-sm">{companyMap.get(s.companyId) ?? s.companyId}</span> },
                    { id: 'period', header: t('settlements_table.period'), renderCell: s => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(s.periodFrom)} — {formatDate(s.periodTo)}</span> },
                    { id: 'gross', header: t('settlements_table.gross'), headerClassName: 'text-right', cellClassName: 'text-right', renderCell: s => formatVnd(s.totalGross) },
                    { id: 'commission', header: t('settlements_table.commission'), headerClassName: 'text-right', cellClassName: 'text-right text-red-500', renderCell: s => formatVnd(s.totalCommission) },
                    { id: 'net', header: t('settlements_table.net'), headerClassName: 'text-right', cellClassName: 'text-right font-semibold text-green-600', renderCell: s => formatVnd(s.totalNet) },
                    { id: 'bookings', header: t('settlements_table.bookings'), headerClassName: 'text-center', cellClassName: 'text-center', renderCell: s => s.bookingCount },
                    {
                        id: 'status',
                        header: t('settlements_table.status'),
                        renderCell: s => (
                            <Badge variant={s.status === 'paid' ? 'success' : 'warning'} className="text-xs">
                                {s.status === 'paid' ? t('filter_paid') : t('filter_pending')}
                            </Badge>
                        ),
                    },
                    {
                        id: 'actions',
                        header: '',
                        renderCell: s => (
                            <div className="flex items-center gap-2">
                                <button className="text-muted-foreground hover:text-foreground p-1" title={t('view_pdf')}>
                                    <FileText className="h-4 w-4" />
                                </button>
                                {s.status === 'pending' && (
                                    <button
                                        onClick={() => { void markPaid(s.id) }}
                                        disabled={isMarkingPaid}
                                        className="text-xs font-medium text-green-600 hover:text-green-700 border border-green-200 rounded px-2 py-1 hover:bg-green-50"
                                    >
                                        {t('mark_paid')}
                                    </button>
                                )}
                            </div>
                        ),
                    },
                ]}
            />

            <Dialog open={dialogOpen} onClose={closeDialog} title={t('create_settlement_title')}>
                <div className="grid gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t('company_label')}</label>
                        <select
                            value={companyId}
                            onChange={(event) => setCompanyId(event.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {companies.map((company) => (
                                <option key={company.busCompanyId} value={company.busCompanyId}>{company.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">{t('date_from')}</label>
                            <input
                                type="date"
                                value={periodFrom}
                                onChange={(event) => setPeriodFrom(event.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">{t('date_to')}</label>
                            <input
                                type="date"
                                value={periodTo}
                                onChange={(event) => setPeriodTo(event.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{t('auto_calculate_info')}</div>
                    <div className="flex gap-2">
                        <Button onClick={() => { void submitSettlement() }} disabled={!companyId || !periodFrom || !periodTo || isCreatingSettlement}>
                            {t('create_settlement')}
                        </Button>
                        <Button variant="outline" onClick={closeDialog} disabled={isCreatingSettlement}>{tCommon('common.cancel')}</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

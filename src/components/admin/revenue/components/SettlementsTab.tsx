import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, CheckCircle2, Clock, DollarSign, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { MOCK_COMPANIES } from '@/data/mock'
import { MOCK_SETTLEMENTS } from '@/data/mock-extended'
import { formatDate, formatVnd } from '@/utils/format'
import { useSettlementsTab } from '../hooks/use-settlements-tab'
import type { SettlementStatus } from '../hooks/use-settlements-tab'
import type { Settlement } from '@/types'

export const SettlementsTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.revenue' })
    const { t: tCommon } = useTranslation()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [settlements, setSettlements] = useState<Settlement[]>(MOCK_SETTLEMENTS)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<SettlementStatus>('all')
    const { openDialog, closeDialog, filtered, companyMap, markPaid } = useSettlementsTab({
        dialogOpen, setDialogOpen, settlements, setSettlements, search, setSearch, statusFilter, setStatusFilter,
    })

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
                <div className="flex rounded-md border border-border overflow-hidden text-sm">
                    {statusOptions.map(([value, label]) => (
                        <button key={value} onClick={() => setStatusFilter(value)}
                            className={`px-3 py-2 ${statusFilter === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                            {label}
                        </button>
                    ))}
                </div>
                <Button size="sm" onClick={openDialog}>
                    <Plus className="h-4 w-4" /> {t('create_settlement')}
                </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('settlements_table.code')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('settlements_table.company')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('settlements_table.period')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('settlements_table.gross')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('settlements_table.commission')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('settlements_table.net')}</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('settlements_table.bookings')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('settlements_table.status')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(s => (
                            <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.referenceCode}</td>
                                <td className="px-4 py-3 font-medium text-sm">{companyMap.get(s.companyId) ?? s.companyId}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDate(s.periodFrom)} — {formatDate(s.periodTo)}
                                </td>
                                <td className="px-4 py-3 text-right">{formatVnd(s.totalGross)}</td>
                                <td className="px-4 py-3 text-right text-red-500">{formatVnd(s.totalCommission)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-green-600">{formatVnd(s.totalNet)}</td>
                                <td className="px-4 py-3 text-center">{s.bookingCount}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={s.status === 'paid' ? 'success' : 'warning'} className="text-xs">
                                        {s.status === 'paid' ? t('filter_paid') : t('filter_pending')}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button className="text-muted-foreground hover:text-foreground p-1" title={t('view_pdf')}>
                                            <FileText className="h-4 w-4" />
                                        </button>
                                        {s.status === 'pending' && (
                                            <button onClick={() => markPaid(s.id)}
                                                className="text-xs font-medium text-green-600 hover:text-green-700 border border-green-200 rounded px-2 py-1 hover:bg-green-50">
                                                {t('mark_paid')}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">{t('no_settlements')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={dialogOpen} onClose={closeDialog} title={t('create_settlement_title')}>
                <div className="grid gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t('company_label')}</label>
                        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                            {MOCK_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">{t('date_from')}</label>
                            <input type="date" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">{t('date_to')}</label>
                            <input type="date" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" />
                        </div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{t('auto_calculate_info')}</div>
                    <div className="flex gap-2">
                        <Button>{t('create_settlement')}</Button>
                        <Button variant="outline" onClick={closeDialog}>{tCommon('common.cancel')}</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

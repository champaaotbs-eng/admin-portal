import { useState } from 'react'
import { Plus, Pencil, Search, Bus, Trash2, X } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utils/format'
import { BUS_TYPES } from './data'
import type { BusType } from './data'
import { useFleetPage } from './hooks/use-fleet-page'

export const CompanyFleetPage = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<BusType | 'all'>('all')
    const {
        filtered,
        stats,
        isLoading,
        isDeleting,
        handleDelete,
        clearFilters, hasFilter,
    } = useFleetPage({
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={() => navigate({ to: '/company/fleet/add' })}>
                    <Plus className="h-4 w-4" /> {t('add_bus')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: t('stats.total'), value: stats.total, color: 'text-foreground' },
                    { label: t('stats.seat'), value: stats.seat, color: 'text-green-500' },
                    { label: t('stats.sleeper'), value: stats.sleeper, color: 'text-orange-500' },
                    { label: t('stats.limousine'), value: stats.limousine, color: 'text-blue-500' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex rounded-md border border-border overflow-hidden text-sm">
                    {(['all', ...BUS_TYPES] as const).map((busType) => (
                        <button
                            key={busType}
                            onClick={() => setTypeFilter(busType)}
                            className={`px-3 py-2 ${typeFilter === busType ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            {busType === 'all' ? tCommon('common.all') : t(`bus_types.${busType}`)}
                        </button>
                    ))}
                </div>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">{tCommon('common.loading')}</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.code')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.name')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.plate')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.type')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.description')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.created_at')}</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{tCommon('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((bus) => (
                                <tr key={bus.busId} className="border-t border-border hover:bg-muted/30">
                                    <td className="px-4 py-3 font-mono text-xs">{bus.busCode || t('empty_value')}</td>
                                    <td className="px-4 py-3 font-medium">{bus.busName || t('empty_value')}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Bus className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-mono text-xs">{bus.licensePlate || t('empty_value')}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-xs">
                                            {t(`bus_types.${bus.busType}`)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                        {bus.description || t('empty_value')}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                        {bus.createdAt ? formatDateTime(bus.createdAt) : t('empty_value')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => navigate({ to: '/company/fleet/edit/$busId', params: { busId: bus.busId } })}>
                                                <Pencil className="h-3.5 w-3.5" />
                                                {tCommon('common.edit')}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                loading={isDeleting}
                                                onClick={() => handleDelete(bus)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                {tCommon('common.delete')}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                        {t('empty_state')}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

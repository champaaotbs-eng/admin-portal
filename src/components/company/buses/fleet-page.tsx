import { useMemo, useState } from 'react'
import { Plus, Pencil, Search, Bus, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaginatedTable, type PaginatedTableColumn } from '@/components/shared/pagination-table'
import { formatDateTime } from '@/utils/format'
import { BUS_TYPES } from './data'
import type { BusType, FleetItem } from './data'
import { useFleetPage } from './hooks/use-fleet-page'
import { BusFormModal } from './components/bus-form-modal'

export const CompanyFleetPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tCommon } = useTranslation()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<BusType | 'all'>('all')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingBusId, setEditingBusId] = useState<string | null>(null)
    const pageSize = 10

    const {
        filtered,
        stats,
        meta,
        isLoading,
        isDeleting,
        handleDelete,
        clearFilters,
        hasFilter,
    } = useFleetPage({
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
        page,
        pageSize,
    })

    const columns = useMemo<PaginatedTableColumn<FleetItem>[]>(() => [
        {
            id: 'code',
            header: t('table.code'),
            renderCell: (bus) => <span className="font-mono text-xs">{bus.busCode || t('empty_value')}</span>,
        },
        {
            id: 'name',
            header: t('table.name'),
            renderCell: (bus) => <span className="font-medium">{bus.busName || t('empty_value')}</span>,
        },
        {
            id: 'plate',
            header: t('table.plate'),
            renderCell: (bus) => (
                <div className="flex items-center gap-2">
                    <Bus className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs">{bus.licensePlate || t('empty_value')}</span>
                </div>
            ),
        },
        {
            id: 'type',
            header: t('table.type'),
            renderCell: (bus) => (
                <Badge variant="outline" className="text-xs">
                    {t(`bus_types.${bus.busType}`)}
                </Badge>
            ),
        },
        {
            id: 'description',
            header: t('table.description'),
            renderCell: (bus) => <span className="text-xs text-muted-foreground">{bus.description || t('empty_value')}</span>,
        },
        {
            id: 'createdAt',
            header: t('table.created_at'),
            renderCell: (bus) => <span className="text-xs text-muted-foreground">{bus.createdAt ? formatDateTime(bus.createdAt) : t('empty_value')}</span>,
        },
        {
            id: 'actions',
            header: tCommon('common.actions'),
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            renderCell: (bus) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBusId(bus.busId)}
                    >
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
            ),
        },
    ], [handleDelete, isDeleting, t, tCommon])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4" /> {t('add_bus')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: t('stats.total'), value: meta.totalItems, color: 'text-foreground' },
                    { label: t('stats.seat'), value: stats.seat, color: 'text-green-500' },
                    { label: t('stats.sleeper'), value: stats.sleeper, color: 'text-orange-500' },
                    { label: t('stats.limousine'), value: stats.limousine, color: 'text-blue-500' },
                ].map((item) => (
                    <Card key={item.label}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative max-w-sm min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <div className="flex overflow-hidden rounded-md border border-border text-sm">
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
                {hasFilter ? (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                ) : null}
            </div>

            <PaginatedTable
                columns={columns}
                data={filtered}
                rowKey={(bus) => bus.busId}
                isLoading={isLoading}
                emptyMessage={t('empty_state')}
                pagination={{
                    currentPage: meta.page,
                    totalPages: meta.totalPages,
                    totalItems: meta.totalItems,
                    pageSize: meta.limit,
                    onPageChange: setPage,
                    labels: {
                        previous: t('pagination.previous'),
                        next: t('pagination.next'),
                        page: t('pagination.page'),
                        showing: t('pagination.showing'),
                        noItems: t('pagination.no_items'),
                    },
                }}
            />

            <BusFormModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <BusFormModal open={Boolean(editingBusId)} busId={editingBusId} onClose={() => setEditingBusId(null)} />
        </div>
    )
}

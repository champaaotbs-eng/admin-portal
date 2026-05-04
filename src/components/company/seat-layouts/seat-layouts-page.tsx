import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { PaginatedTable, type PaginatedTableColumn } from '@/components/shared/pagination-table'
import { formatDateTime } from '@/utils/format'
import type { SeatLayoutSubmitPayload, SeatLayoutRecord } from './hooks/use-seat-layouts-page'
import { useSeatLayoutsPage } from './hooks/use-seat-layouts-page'
import { SeatLayoutForm } from './components/seat-layout-form'

export const CompanySeatLayoutsPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.seat_layouts' })
    const { t: tCommon } = useTranslation()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null)
    const pageSize = 10

    const {
        layouts,
        meta,
        layoutDetail,
        isLoading,
        isDetailLoading,
        isSubmitting,
        isDeleting,
        handleSaveLayout,
        handleDeleteLayout,
    } = useSeatLayoutsPage({
        editingLayoutId,
        isDetailEnabled: isDialogOpen,
        page,
        pageSize,
    })

    const filteredLayouts = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) {
            return layouts
        }

        return layouts.filter((layout) => {
            const searchableFields = [layout.name, layout.seatLayoutId]
            return searchableFields.some((field) => field.toLowerCase().includes(query))
        })
    }, [layouts, search])

    const getSeatCount = (seatLayout: { seats?: Array<unknown> }) => seatLayout.seats?.length ?? 0

    const stats = useMemo(() => ({
        totalLayouts: meta.totalItems,
        totalSeats: layouts.reduce((acc, layout) => acc + getSeatCount(layout), 0),
        averageSeats: layouts.length > 0
            ? Math.round(layouts.reduce((acc, layout) => acc + getSeatCount(layout), 0) / layouts.length)
            : 0,
    }), [layouts, meta.totalItems])

    const activeLayout = useMemo(() => {
        if (!editingLayoutId) {
            return null
        }

        return layoutDetail ?? layouts.find((layout) => layout.seatLayoutId === editingLayoutId) ?? null
    }, [editingLayoutId, layoutDetail, layouts])

    const columns = useMemo<PaginatedTableColumn<SeatLayoutRecord>[]>(() => [
        {
            id: 'name',
            header: t('table.name'),
            renderCell: (layout) => <span className="font-medium">{layout.name || layout.seatLayoutId}</span>,
        },
        {
            id: 'grid',
            header: t('table.grid'),
            renderCell: (layout) => (
                <span className="text-muted-foreground">
                    {t('table.grid_value', {
                        rows: layout.numberRows,
                        columns: layout.numberCols,
                        floors: layout.numberFloors,
                    })}
                </span>
            ),
        },
        {
            id: 'seats',
            header: t('table.seats'),
            renderCell: (layout) => getSeatCount(layout),
        },
        {
            id: 'createdAt',
            header: t('table.created_at'),
            renderCell: (layout) => (
                <span className="text-xs text-muted-foreground">
                    {layout.createdAt ? formatDateTime(layout.createdAt) : t('empty_value')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: tCommon('common.actions'),
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            renderCell: (layout) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setEditingLayoutId(layout.seatLayoutId)
                            setIsDialogOpen(true)
                        }}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        {tCommon('common.edit')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        loading={isDeleting}
                        onClick={() => {
                            void handleDeleteLayout(layout)
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        {tCommon('common.delete')}
                    </Button>
                </div>
            ),
        },
    ], [handleDeleteLayout, isDeleting, t, tCommon])

    const handleSubmitLayout = async (payload: SeatLayoutSubmitPayload) => {
        try {
            await handleSaveLayout(payload, editingLayoutId)
            setIsDialogOpen(false)
            setEditingLayoutId(null)
        } catch {
            // Error toast is handled in the query hook.
        }
    }

    const hasSearch = search.trim().length > 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>

                <Button onClick={() => {
                    setEditingLayoutId(null)
                    setIsDialogOpen(true)
                }}>
                    <Plus className="h-4 w-4" />
                    {t('add_layout')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">{t('stats.total_layouts')}</p>
                        <p className="text-3xl font-bold text-foreground">{stats.totalLayouts}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">{t('stats.total_seats')}</p>
                        <p className="text-3xl font-bold text-primary">{stats.totalSeats}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">{t('stats.avg_seats')}</p>
                        <p className="text-3xl font-bold text-emerald-600">{stats.averageSeats}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('search_placeholder')}
                        className="h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {hasSearch ? (
                        <button
                            type="button"
                            aria-label={t('clear_search_aria')}
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) : null}
                </div>
            </div>

            <PaginatedTable
                columns={columns}
                data={filteredLayouts}
                rowKey={(layout) => layout.seatLayoutId}
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

            <Dialog
                open={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false)
                    setEditingLayoutId(null)
                }}
                title={editingLayoutId ? t('edit_layout_title') : t('add_layout_title')}
                className="max-w-6xl"
            >
                <div className="max-h-[75vh] overflow-y-auto pr-2">
                    <SeatLayoutForm
                        initialLayout={activeLayout}
                        isSubmitting={isSubmitting}
                        isDetailLoading={isDetailLoading}
                        onSubmit={handleSubmitLayout}
                        onCancel={() => {
                            setIsDialogOpen(false)
                            setEditingLayoutId(null)
                        }}
                    />
                </div>
            </Dialog>
        </div>
    )
}

import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { formatDateTime } from '@/utils/format'
import { useAuthStore } from '@/store/auth.store'
import type { SeatLayoutSubmitPayload } from './hooks/use-seat-layouts-page'
import { useSeatLayoutsPage } from './hooks/use-seat-layouts-page'
import { SeatLayoutForm } from './components/seat-layout-form'

const getCompanyIdFromAdmin = (admin: unknown): string => {
    if (!admin || typeof admin !== 'object') {
        return ''
    }

    const source = admin as {
        busCompanyId?: string
        companyId?: string
        id?: string | number
        company?: { busCompanyId?: string; companyId?: string }
        busCompany?: { busCompanyId?: string; id?: string | number }
    }

    const rawId = source.busCompanyId
        ?? source.companyId
        ?? source.company?.busCompanyId
        ?? source.company?.companyId
        ?? source.busCompany?.busCompanyId
        ?? source.busCompany?.id
        ?? source.id

    if (typeof rawId === 'number') {
        return String(rawId)
    }

    return rawId ?? ''
}

export const CompanySeatLayoutsPage = () => {
    const { admin } = useAuthStore()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.seat_layouts' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null)

    const busCompanyId = useMemo(() => getCompanyIdFromAdmin(admin), [admin])

    const {
        layouts,
        layoutDetail,
        isLoading,
        isDetailLoading,
        isSubmitting,
        isDeleting,
        handleSaveLayout,
        handleDeleteLayout,
    } = useSeatLayoutsPage({
        busCompanyId,
        editingLayoutId,
        isDetailEnabled: isDialogOpen,
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

    const stats = useMemo(() => {
        return {
            totalLayouts: layouts.length,
            totalSeats: layouts.reduce((accumulator, layout) => accumulator + getSeatCount(layout), 0),
            averageSeats: layouts.length > 0
                ? Math.round(layouts.reduce((accumulator, layout) => accumulator + getSeatCount(layout), 0) / layouts.length)
                : 0,
        }
    }, [layouts])

    const activeLayout = useMemo(() => {
        if (!editingLayoutId) {
            return null
        }

        return layoutDetail ?? layouts.find((layout) => layout.seatLayoutId === editingLayoutId) ?? null
    }, [editingLayoutId, layoutDetail, layouts])

    const closeDialog = () => {
        setIsDialogOpen(false)
        setEditingLayoutId(null)
    }

    const openCreateDialog = () => {
        setEditingLayoutId(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (seatLayoutId: string) => {
        setEditingLayoutId(seatLayoutId)
        setIsDialogOpen(true)
    }

    const handleSubmitLayout = async (payload: SeatLayoutSubmitPayload) => {
        try {
            await handleSaveLayout(payload, editingLayoutId)
            closeDialog()
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

                <Button onClick={openCreateDialog}>
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

            {isLoading ? (
                <p className="text-sm text-muted-foreground">{tCommon('common.loading')}</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.name')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.grid')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.seats')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.created_at')}</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{tCommon('common.actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredLayouts.map((layout) => (
                                <tr key={layout.seatLayoutId} className="border-t border-border hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">
                                        {layout.name || layout.seatLayoutId}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {t('table.grid_value', {
                                            rows: layout.numberRows,
                                            columns: layout.numberCols,
                                            floors: layout.numberFloors,
                                        })}
                                    </td>
                                    <td className="px-4 py-3">{getSeatCount(layout)}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                        {layout.createdAt ? formatDateTime(layout.createdAt) : t('empty_value')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(layout.seatLayoutId)}
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
                                    </td>
                                </tr>
                            ))}

                            {filteredLayouts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        {t('empty_state')}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog
                open={isDialogOpen}
                onClose={closeDialog}
                title={editingLayoutId ? t('edit_layout_title') : t('add_layout_title')}
                className="max-w-6xl"
            >
                <div className="max-h-[75vh] overflow-y-auto pr-2">
                    <SeatLayoutForm
                        initialLayout={activeLayout}
                        isSubmitting={isSubmitting}
                        isDetailLoading={isDetailLoading}
                        onSubmit={handleSubmitLayout}
                        onCancel={closeDialog}
                    />
                </div>
            </Dialog>
        </div>
    )
}

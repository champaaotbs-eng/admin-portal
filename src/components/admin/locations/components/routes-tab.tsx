import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, ArrowRight, Navigation, Clock, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { RouteForm } from './route-form'
import { fmtDuration } from '../data'
import { useRoutesTab } from '../hooks/use-routes-tab'

export const RoutesTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.locations' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const {
        openDialog,
        closeDialog,
        filtered,
        locations,
        submitRoute,
        isSubmitting,
        isLoading,
    } = useRoutesTab({ search, setDialogOpen })

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_route')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <Button size="sm" onClick={openDialog}>
                    <Plus className="h-4 w-4" /> {t('add_route')}
                </Button>
            </div>

            {isLoading ? <p className="text-sm text-muted-foreground">{t('loading', { defaultValue: 'Dang tai du lieu...' })}</p> : null}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_routes.route')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_routes.distance')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_routes.duration')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_routes.trips')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_routes.status')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => (
                            <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 max-w-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground truncate">{r.fromLabel}</span>
                                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs font-medium truncate">{r.toLabel}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Navigation className="h-3.5 w-3.5" />{r.distanceKm} km
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />{fmtDuration(r.estimatedMinutes)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium">{r.tripCount}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={r.isActive ? 'success' : 'destructive'} className="text-xs">
                                        {r.isActive ? tCommon('status.active') : tCommon('status.inactive')}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1">
                                        <button className="text-muted-foreground hover:text-foreground p-1">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button className="text-muted-foreground hover:text-red-500 p-1">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">{t('no_routes')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={dialogOpen} onClose={closeDialog} title={t('add_route_title')}>
                <RouteForm
                    locations={locations}
                    onSubmit={submitRoute}
                    onCancel={closeDialog}
                    isSubmitting={isSubmitting}
                />
            </Dialog>
        </div>
    )
}

import { useState } from 'react'
import { Plus, Search, Calendar, Clock, MapPin, Bus, X, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { STATUS_VARIANTS } from './data'
import { useTripsPage } from './hooks/use-trips-page'
import { TripForm } from './components/TripForm'

export const CompanyTripsPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.trips' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const {
        filtered, stats,
        openDialog, closeDialog,
        clearFilters, hasFilter,
    } = useTripsPage({ search, setSearch, statusFilter, setStatusFilter, setDialogOpen })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={openDialog}>
                    <Plus className="h-4 w-4" /> {t('add_trip')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: t('stats.total'), value: stats.total, color: 'text-foreground' },
                    { label: t('stats.scheduled'), value: stats.scheduled, color: 'text-blue-500' },
                    { label: t('stats.completed'), value: stats.completed, color: 'text-green-500' },
                    { label: t('stats.cancelled'), value: stats.cancelled, color: 'text-red-500' },
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
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none">
                    <option value="all">{tCommon('status.all')}</option>
                    <option value="scheduled">{tCommon('status.scheduled')}</option>
                    <option value="in_progress">{tCommon('status.in_progress')}</option>
                    <option value="completed">{tCommon('status.completed')}</option>
                    <option value="cancelled">{tCommon('status.cancelled')}</option>
                </select>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.route')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.departure')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.bus')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.driver')}</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('table.seats_sold')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('table.price')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.status')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(trip => (
                            <tr key={trip.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                        {trip.route}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(trip.departure).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {new Date(trip.departure).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1 text-xs">
                                        <Bus className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-mono">{trip.bus}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">{trip.driver}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs">
                                            <span className={trip.sold === trip.seats ? 'text-green-600 font-semibold' : ''}>
                                                {trip.sold}
                                            </span>
                                            /{trip.seats}
                                        </span>
                                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                                            <div className={`h-full rounded-full ${trip.sold === trip.seats ? 'bg-green-500' : 'bg-primary'}`}
                                                style={{ width: `${(trip.sold / trip.seats) * 100}%` }} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {trip.price.toLocaleString('vi-VN')}₫
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={STATUS_VARIANTS[trip.status] ?? 'secondary'} className="text-xs">
                                        {tCommon(`status.${trip.status}`)}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <button className="text-xs text-primary hover:underline">{tCommon('common.view')}</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                                    {tCommon('common.no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={dialogOpen} onClose={closeDialog} title={t('add_trip_title')}>
                <TripForm
                    onSubmit={() => closeDialog()}
                    onCancel={closeDialog}
                />
            </Dialog>
        </div>
    )
}

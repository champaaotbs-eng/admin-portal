import { useState } from 'react'
import { Plus, Pencil, Search, Bus, CheckCircle2, WrenchIcon, PauseCircle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { STATUS_VARIANTS, BUS_TYPES } from './data'
import type { BusType, FleetItem } from './data'
import { useFleetPage } from './hooks/use-fleet-page'
import { VehicleForm } from './components/VehicleForm'

const STATUS_ICONS = {
    active: CheckCircle2,
    maintenance: WrenchIcon,
    inactive: PauseCircle,
}

export const CompanyFleetPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.fleet' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<BusType | 'all'>('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<FleetItem | null>(null)
    const {
        filtered, stats,
        openAdd, openEdit, closeDialog,
        clearFilters, hasFilter,
    } = useFleetPage({ search, setSearch, typeFilter, setTypeFilter, setDialogOpen, setSelected })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" /> {t('add_vehicle')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: t('stats.total'), value: stats.total, color: 'text-foreground' },
                    { label: t('stats.active'), value: stats.active, color: 'text-green-500' },
                    { label: t('stats.maintenance'), value: stats.maintenance, color: 'text-orange-500' },
                    { label: t('stats.inactive'), value: stats.inactive, color: 'text-muted-foreground' },
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
                    {(['all', ...BUS_TYPES] as const).map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`px-3 py-2 ${typeFilter === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                            {t === 'all' ? tCommon('common.all') : t(`bus_types.${t}`)}
                        </button>
                    ))}
                </div>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(bus => {
                    const st = STATUS_VARIANTS[bus.status as keyof typeof STATUS_VARIANTS] ?? STATUS_VARIANTS.inactive
                    const StIcon = STATUS_ICONS[bus.status as keyof typeof STATUS_ICONS] ?? PauseCircle
                    return (
                        <Card key={bus.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                            <Bus className="h-5 w-5 text-primary" />
                                        </span>
                                        <div>
                                            <p className="font-mono font-semibold text-sm">{bus.plateNumber}</p>
                                            <p className="text-xs text-muted-foreground">{t(`bus_types.${bus.type}`)}</p>
                                        </div>
                                    </div>
                                    <Badge variant={st.variant} className="text-xs flex items-center gap-1">
                                        <StIcon className="h-3 w-3" />
                                        {st.label}
                                    </Badge>
                                </div>

                                <p className="text-sm font-medium truncate">{bus.name}</p>

                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{bus.totalSeats} cho ngoi</span>
                                    <span>{bus.trips} chuyen da chay</span>
                                </div>

                                {bus.routes.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {bus.routes.map(r => (
                                            <span key={r} className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs">{r}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end pt-1">
                                    <button onClick={() => openEdit(bus)}
                                        className="flex items-center gap-1 text-xs text-primary hover:underline">
                                        <Pencil className="h-3 w-3" /> {tCommon('common.edit')}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full py-16 text-center text-muted-foreground">
                        <Bus className="mx-auto h-10 w-10 opacity-20 mb-2" />
                        <p>{tCommon('common.no_results')}</p>
                    </div>
                )}
            </div>

            <Dialog open={dialogOpen} onClose={closeDialog} title={selected ? t('edit_vehicle_title') : t('add_vehicle_title')}>
                <VehicleForm
                    defaultValues={selected ? { plate: selected.plateNumber, name: selected.name, type: selected.type, seats: String(selected.totalSeats) } : undefined}
                    onSubmit={closeDialog}
                    onCancel={closeDialog}
                />
            </Dialog>
        </div>
    )
}

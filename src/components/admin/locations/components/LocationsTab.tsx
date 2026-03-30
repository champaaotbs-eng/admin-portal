import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { StationForm } from './StationForm'
import { provinces } from '../data'
import { useLocationsTab } from '../hooks/use-locations-tab'

export const LocationsTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.locations' })
    const [search, setSearch] = useState('')
    const [provinceFilter, setProvinceFilter] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const { openDialog, closeDialog, filtered } = useLocationsTab({ search, provinceFilter, setDialogOpen })

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_station')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <select value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">{t('all_provinces')}</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Button size="sm" onClick={openDialog}>
                    <Plus className="h-4 w-4" /> {t('add_station')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(l => (
                    <div key={l.id} className="rounded-lg border border-border p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                </span>
                                <p className="font-semibold text-sm leading-tight">{l.name}</p>
                            </div>
                            <div className="flex gap-1">
                                <button className="text-muted-foreground hover:text-foreground p-1">
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button className="text-muted-foreground hover:text-red-500 p-1">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{l.address}</p>
                        <Badge variant="outline" className="text-xs">{l.provinceName}</Badge>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                            {l.lat.toFixed(4)}, {l.lng.toFixed(4)}
                        </p>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-10">{t('no_stations')}</p>
                )}
            </div>

            <Dialog open={dialogOpen} onClose={closeDialog} title={t('add_station_title')}>
                <StationForm onSubmit={closeDialog} onCancel={closeDialog} />
            </Dialog>
        </div>
    )
}

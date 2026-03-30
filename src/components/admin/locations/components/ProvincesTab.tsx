import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { locations } from '../data'
import { useProvincesTab } from '../hooks/use-provinces-tab'

export const ProvincesTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.locations' })
    const [search, setSearch] = useState('')
    const { filtered } = useProvincesTab({ search })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_province')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <p className="text-sm text-muted-foreground">{t('results_count', { count: filtered.length })}</p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_provinces.index')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_provinces.name')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_provinces.code')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_provinces.type')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table_provinces.stations')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p, i) => (
                            <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                                <td className="px-4 py-3 font-medium">{p.name}</td>
                                <td className="px-4 py-3 text-muted-foreground font-mono">{p.code}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={p.divisionType.includes('Thanh pho') ? 'default' : 'secondary'} className="text-xs">
                                        {p.divisionType.includes('Thanh pho truc') ? t('province_city') : t('province_province')}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {locations.filter(l => l.provinceId === p.id).length}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

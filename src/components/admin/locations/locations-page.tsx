import { useTranslation } from 'react-i18next'
import { Map, MapPin, Route, Navigation } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProvincesTab } from './components/ProvincesTab'
import { LocationsTab } from './components/LocationsTab'
import { RoutesTab } from './components/RoutesTab'
import { provinces, locations, routes } from './data'

export const AdminLocationsPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.locations' })
    const stats = [
        { label: t('stats.provinces'), value: provinces.length, icon: Map, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: t('stats.stations'), value: locations.length, icon: MapPin, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: t('stats.routes'), value: routes.length, icon: Route, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: t('stats.active_routes'), value: routes.filter(r => r.isActive).length, icon: Navigation, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {stats.map(s => {
                    const Icon = s.icon
                    return (
                        <Card key={s.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                                    <Icon className={`h-4 w-4 ${s.color}`} />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className="text-xl font-bold">{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Tabs defaultValue="routes">
                <TabsList>
                    <TabsTrigger value="provinces">{t('tab_provinces')} ({provinces.length})</TabsTrigger>
                    <TabsTrigger value="locations">{t('tab_locations')} ({locations.length})</TabsTrigger>
                    <TabsTrigger value="routes">{t('tab_routes')} ({routes.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="provinces"><ProvincesTab /></TabsContent>
                <TabsContent value="locations"><LocationsTab /></TabsContent>
                <TabsContent value="routes"><RoutesTab /></TabsContent>
            </Tabs>
        </div>
    )
}

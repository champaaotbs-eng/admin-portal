import { useQuery } from '@tanstack/react-query'
import { getAllRoutes, getAllTrips } from '@/services/trip.service'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration, formatDate, formatVnd } from '@/utils/format'
import { useTranslation } from 'react-i18next'

const tripStatusVariant = (s: string) => {
    const map: Record<string, 'default' | 'success' | 'secondary' | 'destructive' | 'warning'> = {
        scheduled: 'default',
        active: 'warning',
        completed: 'success',
        cancelled: 'destructive',
    }
    return map[s] ?? 'secondary'
}

export function AdminRoutesPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.routes' })
    const { t: tCommon } = useTranslation()

    const { data: routes = [], isLoading: loadingRoutes } = useQuery({
        queryKey: ['admin', 'routes'],
        queryFn: getAllRoutes,
    })

    const { data: trips = [], isLoading: loadingTrips } = useQuery({
        queryKey: ['admin', 'trips'],
        queryFn: getAllTrips,
    })

    if (loadingRoutes || loadingTrips) return <div className="text-muted-foreground">{tCommon('common.loading')}</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">
                    {t('routes_count', { count: routes.length })} · {t('trips_count', { count: trips.length })}
                </p>
            </div>

            <div>
                <h2 className="mb-3 text-lg font-semibold">{t('routes_section')}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {routes.map((r) => (
                        <Card key={r.id}>
                            <CardContent className="pt-5">
                                <p className="font-semibold">{r.from} → {r.to}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {r.distanceKm} km · {formatDuration(r.estimatedMinutes)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="mb-3 text-lg font-semibold">{t('all_trips_section')}</h2>
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                {[
                                    t('trips_table.route'),
                                    t('trips_table.company'),
                                    t('trips_table.departure'),
                                    t('trips_table.price_per_seat'),
                                    t('trips_table.seats_left'),
                                    t('trips_table.status'),
                                ].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map((tr) => (
                                <tr key={tr.id} className="border-t border-border hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{tr.route.from} → {tr.route.to}</td>
                                    <td className="px-4 py-3">{tr.company.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatDate(tr.departureTime, true)}</td>
                                    <td className="px-4 py-3">{formatVnd(tr.pricePerSeat)}</td>
                                    <td className="px-4 py-3">{tr.availableSeats}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={tripStatusVariant(tr.status)}>
                                            {tCommon(`status.${tr.status}`)}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

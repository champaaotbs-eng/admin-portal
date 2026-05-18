import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RouteDirection } from '@/components/shared/route-direction'
import { tripSchema, type TripFormData } from '../validation-schema'
import { getAllRoutes } from 'services/company/routes.service'
import { getAllBuses, getCompanyBusCurrentLocation } from 'services/company/bus.service'
import { checkCompanyTripBusAvailability } from 'services/company/trip.service'
import type { IRoute } from 'types/route'
import type { IBus, IBusCurrentLocation } from 'types/bus'
import { SeatPriceEditor } from './SeatPriceEditor'

const readRows = <T,>(payload: unknown): T[] => {
    if (!payload || typeof payload !== 'object') return []
    const p = payload as Record<string, unknown>
    if (Array.isArray(p.result)) return p.result as T[]
    if (Array.isArray(p.data)) return p.data as T[]
    if (p.data && typeof p.data === 'object') {
        const nested = p.data as Record<string, unknown>
        if (Array.isArray(nested.result)) return nested.result as T[]
    }
    return []
}

const readObject = <T,>(payload: unknown): T | undefined => {
    if (!payload || typeof payload !== 'object') return undefined
    const p = payload as Record<string, unknown>
    if (p.data && typeof p.data === 'object') return p.data as T
    return p as T
}

const isValidDateRange = (departureTime?: string, arrivalTime?: string) => {
    if (!departureTime || !arrivalTime) return false
    const departure = new Date(departureTime).getTime()
    const arrival = new Date(arrivalTime).getTime()
    return Number.isFinite(departure) && Number.isFinite(arrival) && departure < arrival
}

const formatCurrentLocation = (
    location: IBusCurrentLocation | undefined,
    t: any,
) => {
    if (!location || !location.available || location.state === 'UNKNOWN') {
        return t('current_location_unknown')
    }

    if (location.locationType === 'ROUTE') {
        const source = location.source?.label || t('unknown_location')
        const destination = location.destination?.label || t('unknown_location')
        return t('current_location_route', { source, destination })
    }

    return location.label || t('unknown_location')
}

interface TripFormProps {
    onSubmit: (data: TripFormData) => void
    onCancel: () => void
    defaultValues?: Partial<TripFormData>
    isSubmitting?: boolean
    excludeTripId?: string
}

export const TripForm = ({ onSubmit, onCancel, defaultValues, isSubmitting, excludeTripId }: TripFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.trips' })
    const { t: tCommon } = useTranslation()

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<TripFormData>({
        resolver: zodResolver(tripSchema(t)),
        defaultValues: {
            routeId: '',
            busVersionId: '',
            departureTime: '',
            arrivalTime: '',
            basePrice: '',
            isPublished: true,
            seatPrices: [],
            ...defaultValues,
        },
        mode: 'onChange',
    })

    const busVersionId = useWatch({ control, name: 'busVersionId' })
    const routeId = useWatch({ control, name: 'routeId' })
    const basePrice = useWatch({ control, name: 'basePrice' })
    const seatPrices = useWatch({ control, name: 'seatPrices' })
    const departureTime = useWatch({ control, name: 'departureTime' })
    const arrivalTime = useWatch({ control, name: 'arrivalTime' })

    const routesQuery = useQuery({
        queryKey: ['company-routes-select'],
        queryFn: () => getAllRoutes({ page: 1, limit: 100 }),
        select: (res) => readRows<IRoute>(res.data),
        staleTime: 60_000,
    })

    const busesQuery = useQuery({
        queryKey: ['company-buses-select'],
        queryFn: () => getAllBuses({ page: 1, limit: 100 }),
        select: (res) => readRows<IBus>(res),
        staleTime: 60_000,
    })

    const routes = routesQuery.data ?? []
    const buses = busesQuery.data ?? []

    // Find the selected bus to get its seat layout
    const selectedBus = buses.find(b => b.latestVersion?.busVersionId === busVersionId)
    const selectedRoute = routes.find(r => r.routeId === routeId)
    const seats = selectedBus?.seatLayout?.seats ?? []
    const canCheckAvailability = !!busVersionId && isValidDateRange(departureTime, arrivalTime)

    const busLocationQuery = useQuery({
        queryKey: ['company-bus-current-location', selectedBus?.busId],
        queryFn: () => getCompanyBusCurrentLocation(selectedBus!.busId),
        select: (res) => readObject<IBusCurrentLocation>(res),
        enabled: !!selectedBus?.busId,
        staleTime: 30_000,
    })

    const busAvailabilityQuery = useQuery({
        queryKey: ['company-trip-bus-availability', busVersionId, departureTime, arrivalTime, excludeTripId],
        queryFn: () => checkCompanyTripBusAvailability({
            busVersionId: busVersionId!,
            departureTime: new Date(departureTime).toISOString(),
            arrivalTime: new Date(arrivalTime).toISOString(),
            excludeTripId,
        }),
        select: (res) => readObject<{ available: boolean }>(res),
        enabled: canCheckAvailability,
        staleTime: 10_000,
    })

    const busUnavailable = busAvailabilityQuery.data?.available === false
    const currentLocation = busLocationQuery.data

    const routeLabel = (r: IRoute) =>
        r.fromLocationName && r.toLocationName
            ? `${r.fromLocationName} → ${r.toLocationName}`
            : `${r.fromLocationId} → ${r.toLocationId}`

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Controller name="routeId" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('form.route')}</label>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">{tCommon('common.select_option')}</option>
                        {routes.map(r => (
                            <option key={r.routeId} value={r.routeId}>{routeLabel(r)}</option>
                        ))}
                    </select>
                    {errors.routeId && <p className="text-xs text-destructive mt-1">{errors.routeId.message}</p>}
                    {selectedRoute && (
                        <div className="mt-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                            <RouteDirection
                                pickup={selectedRoute.fromLocationName || t('unknown_location')}
                                dropoff={selectedRoute.toLocationName || t('unknown_location')}
                                pickupLabel={t('stop_type_pickup')}
                                dropoffLabel={t('stop_type_dropoff')}
                            />
                        </div>
                    )}
                </div>
            )} />

            <Controller name="busVersionId" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('form.bus')}</label>
                    <select
                        value={field.value ?? ''}
                        onChange={(e) => { field.onChange(e.target.value); setValue('seatPrices', []) }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">{tCommon('common.select_option')}</option>
                        {buses.map(b => b.latestVersion?.busVersionId ? (
                            <option key={b.busId} value={b.latestVersion.busVersionId}>
                                {b.busName} ({b.licensePlate})
                            </option>
                        ) : null)}
                    </select>
                    {errors.busVersionId && <p className="text-xs text-destructive mt-1">{errors.busVersionId.message}</p>}
                    {selectedBus && (
                        <div className="mt-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">{t('current_location')}</p>
                            {busLocationQuery.isLoading ? (
                                <p>{tCommon('common.loading')}</p>
                            ) : busLocationQuery.isError ? (
                                <p className="text-destructive">{t('current_location_error')}</p>
                            ) : (
                                <p>
                                    {formatCurrentLocation(currentLocation, t)}
                                    {currentLocation?.address ? ` - ${currentLocation.address}` : ''}
                                </p>
                            )}
                        </div>
                    )}
                    {busUnavailable && (
                        <p className="text-xs text-destructive mt-1">{t('errors.bus_not_available_for_trip_time')}</p>
                    )}
                </div>
            )} />

            <div className="grid grid-cols-2 gap-3">
                <Controller name="departureTime" control={control} render={({ field }) => (
                    <Input {...field} label={t('form.departure')} type="datetime-local" error={errors.departureTime?.message} />
                )} />
                <Controller name="arrivalTime" control={control} render={({ field }) => (
                    <Input {...field} label={t('form.arrival')} type="datetime-local" error={errors.arrivalTime?.message} />
                )} />
            </div>

            <Controller name="basePrice" control={control} render={({ field }) => (
                <Input {...field} label={t('form.price')} type="number" placeholder="220000" error={errors.basePrice?.message} />
            )} />

            {seats.length > 0 && (
                <SeatPriceEditor
                    seats={seats}
                    basePrice={Number(basePrice) || 0}
                    value={seatPrices ?? []}
                    onChange={(prices) => setValue('seatPrices', prices)}
                />
            )}

            <Controller name="isPublished" control={control} render={({ field }) => (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        checked={field.value ?? true}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                    />
                    {t('form.is_published')}
                </label>
            )} />

            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isSubmitting || busUnavailable}>
                    {isSubmitting ? tCommon('common.loading') : tCommon('common.save')}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

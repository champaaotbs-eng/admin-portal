import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { tripSchema, type TripFormData } from '../validation-schema'
import { getAllRoutes } from 'services/company/routes.service'
import { getAllBuses } from 'services/company/bus.service'
import type { IRoute } from 'types/route'
import type { IBus } from 'types/bus'

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

interface TripFormProps {
    onSubmit: (data: TripFormData) => void
    onCancel: () => void
    defaultValues?: Partial<TripFormData>
    isSubmitting?: boolean
}

export const TripForm = ({ onSubmit, onCancel, defaultValues, isSubmitting }: TripFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.trips' })
    const { t: tCommon } = useTranslation()

    const { control, handleSubmit, formState: { errors } } = useForm<TripFormData>({
        resolver: zodResolver(tripSchema(t)),
        defaultValues: {
            routeId: '',
            busVersionId: '',
            departureTime: '',
            arrivalTime: '',
            basePrice: '',
            isPublished: true,
            ...defaultValues,
        },
        mode: 'onChange',
    })

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
                </div>
            )} />

            <Controller name="busVersionId" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('form.bus')}</label>
                    <select
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
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
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? tCommon('common.loading') : tCommon('common.save')}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

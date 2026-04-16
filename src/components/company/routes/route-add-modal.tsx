import { useCallback, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AsyncSelect, type AsyncSelectOption } from '@/components/ui/async-select'
import { ERouteStopType } from 'configs/constants'
import type { TRouteFormData } from './validation-schema'
import { routeSchema } from './validation-schema'

interface RouteAddModalProps {
    open: boolean
    onClose: () => void
    initialCompanyId: string
    lockBusCompany: boolean
    stationLabelById: Record<string, string>
    isSubmitting: boolean
    fetchBusCompanyOptions: (searchValue: string, page: number, limit: number, selectedCompanyId?: string) => Promise<AsyncSelectOption[]>
    fetchStationOptions: (searchValue: string, page: number, limit: number, selectedStationId?: string) => Promise<AsyncSelectOption[]>
    onSubmit: (values: TRouteFormData) => void
}

const toDefaultValues = (busCompanyId: string): TRouteFormData => ({
    busCompanyId,
    distanceKm: '',
    estimateDurationMins: '',
    routeStops: [],
})

export const RouteAddModal = ({
    open,
    onClose,
    initialCompanyId,
    lockBusCompany,
    stationLabelById,
    isSubmitting,
    fetchBusCompanyOptions,
    fetchStationOptions,
    onSubmit,
}: RouteAddModalProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.company_routes' })
    const { t: tRoot } = useTranslation()
    const schema = useMemo(() => routeSchema(tRoot), [tRoot])

    const form = useForm<TRouteFormData>({
        resolver: zodResolver(schema),
        defaultValues: toDefaultValues(initialCompanyId),
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'routeStops',
    })
    const watchedRouteStops = form.watch('routeStops')

    const handleAddStop = useCallback(() => {
        append({
            stationId: '',
            stopType: ERouteStopType.BOTH,
            stopOrder: fields.length + 1,
            offsetMins: '0',
            isActive: true,
        })
    }, [append, fields.length])

    const arrangementPreview = useMemo(() => {
        if (!watchedRouteStops || watchedRouteStops.length === 0) {
            return t('form.arrangement_empty')
        }

        const labels = watchedRouteStops.map((stop, index) => {
            if (!stop.stationId) {
                return t('form.unselected_station', { order: index + 1 })
            }

            return stationLabelById[stop.stationId] || stop.stationId
        })

        return labels.join(' -> ')
    }, [watchedRouteStops, stationLabelById, t])

    const handleSubmit = form.handleSubmit((values) => {
        const normalizedValues: TRouteFormData = {
            ...values,
            routeStops: values.routeStops.map((stop, index) => ({
                ...stop,
                stopOrder: index + 1,
                offsetMins: String(stop.offsetMins),
            })),
        }

        onSubmit(normalizedValues)
        form.reset(toDefaultValues(initialCompanyId))
    })

    const handleClose = () => {
        form.reset(toDefaultValues(initialCompanyId))
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            title={t('add_route_title')}
            className="max-w-4xl"
        >
            <div className="max-h-[70vh] overflow-y-auto">
                <form className="space-y-4 pr-4" onSubmit={handleSubmit}>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('form.bus_company_id')}</label>
                            <Controller
                                name="busCompanyId"
                                control={form.control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                        fetchOptions={(searchValue, page, limit) =>
                                            fetchBusCompanyOptions(searchValue, page, limit, field.value)
                                        }
                                        placeholder={t('form.bus_company_placeholder')}
                                        searchPlaceholder={t('form.bus_company_search_placeholder')}
                                        disabled={lockBusCompany}
                                    />
                                )}
                            />
                            {form.formState.errors.busCompanyId?.message ? (
                                <p className="text-xs text-destructive">{form.formState.errors.busCompanyId.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('form.distance_km')}</label>
                            <input
                                {...form.register('distanceKm')}
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="120"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {form.formState.errors.distanceKm?.message ? (
                                <p className="text-xs text-destructive">{form.formState.errors.distanceKm.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('form.estimate_duration_mins')}</label>
                            <input
                                {...form.register('estimateDurationMins')}
                                type="number"
                                min="0"
                                step="1"
                                placeholder="180"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {form.formState.errors.estimateDurationMins?.message ? (
                                <p className="text-xs text-destructive">{form.formState.errors.estimateDurationMins.message}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-3 rounded-lg border border-border p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">{t('form.route_stops')}</h3>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddStop}>
                                <Plus className="h-4 w-4" />
                                {t('form.add_stop')}
                            </Button>
                        </div>

                        <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
                            <span className="font-semibold">{t('form.arrangement_preview')}: </span>
                            <span>{arrangementPreview}</span>
                        </p>

                        {fields.length === 0 ? (
                            <p className="rounded-md border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
                                {t('form.no_stops')}
                            </p>
                        ) : null}

                        {fields.map((field, index) => {
                            const stopErrors = form.formState.errors.routeStops?.[index]

                            return (
                                <div key={field.id} className="space-y-3 rounded-md border border-border p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {t('form.stop_order', { order: index + 1 })}
                                        </span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                            {t('form.remove_stop')}
                                        </Button>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-sm font-medium">{t('form.station')}</label>
                                            <Controller
                                                name={`routeStops.${index}.stationId` as const}
                                                control={form.control}
                                                render={({ field: stopField }) => (
                                                    <AsyncSelect
                                                        value={stopField.value}
                                                        onChange={stopField.onChange}
                                                        fetchOptions={(searchValue, page, limit) =>
                                                            fetchStationOptions(searchValue, page, limit, stopField.value)
                                                        }
                                                        placeholder={t('form.select_station')}
                                                        searchPlaceholder={t('form.station_search_placeholder')}
                                                    />
                                                )}
                                            />
                                            {stopErrors?.stationId?.message ? (
                                                <p className="text-xs text-destructive">{stopErrors.stationId.message}</p>
                                            ) : null}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">{t('form.stop_type')}</label>
                                            <select
                                                {...form.register(`routeStops.${index}.stopType`)}
                                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value={ERouteStopType.PICKUP}>{t('stop_type.pickup')}</option>
                                                <option value={ERouteStopType.DROPOFF}>{t('stop_type.dropoff')}</option>
                                                <option value={ERouteStopType.BOTH}>{t('stop_type.both')}</option>
                                            </select>
                                            {stopErrors?.stopType?.message ? (
                                                <p className="text-xs text-destructive">{stopErrors.stopType.message}</p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">{t('form.offset_mins')}</label>
                                            <input
                                                {...form.register(`routeStops.${index}.offsetMins`)}
                                                type="number"
                                                min="0"
                                                step="1"
                                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                            {stopErrors?.offsetMins?.message ? (
                                                <p className="text-xs text-destructive">{stopErrors.offsetMins.message}</p>
                                            ) : null}
                                        </div>

                                        <div className="flex items-end pb-1">
                                            <label className="inline-flex items-center gap-2 text-sm font-medium">
                                                <input
                                                    {...form.register(`routeStops.${index}.isActive`)}
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-input"
                                                />
                                                <span>{t('form.is_active')}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            {tRoot('common.cancel')}
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {tRoot('common.save')}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAllSeatLayouts } from 'services/company/seat-layout.service'
import type { ISeatLayout } from 'types/seat-layout'
import { BUS_TYPES } from '../data'
import { defaultVehicleFormValues, vehicleSchema } from '../validation-schema'
import type { VehicleFormData } from '../validation-schema'
import { normalizeSeatLayoutList } from 'components/company/seat-layouts/utils/normalize-seat-layout'
import { SeatLayoutPreview } from './seat-layout-preview'

export const VehicleForm = ({
    defaultValues,
    initialPreviewLayout,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: {
    defaultValues?: Partial<VehicleFormData>
    initialPreviewLayout?: ISeatLayout | null
    onSubmit: (data: VehicleFormData) => Promise<void> | void
    onCancel: () => void
    isSubmitting?: boolean
}) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tCommon } = useTranslation()
    const { control, handleSubmit, watch, formState: { errors } } = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema(t)),
        defaultValues: {
            ...defaultVehicleFormValues,
            type: BUS_TYPES[0],
            ...defaultValues,
        },
        mode: 'onChange',
    })

    const seatLayoutId = watch('seatLayoutId')

    const seatLayoutsQuery = useQuery({
        queryKey: ['company-seat-layouts', 'selector'],
        queryFn: () => getAllSeatLayouts({ page: 1, limit: 500 }),
        select: (response) => normalizeSeatLayoutList(response.data ?? response),
    })

    const selectedSeatLayout = useMemo(() => {
        const selectedFromList = seatLayoutsQuery.data?.find((layout) => layout.seatLayoutId === seatLayoutId) ?? null

        if (selectedFromList) {
            return selectedFromList
        }

        if (initialPreviewLayout?.seatLayoutId === seatLayoutId) {
            return initialPreviewLayout
        }

        return null
    }, [seatLayoutId, seatLayoutsQuery.data, initialPreviewLayout])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">{t('form.bus_information')}</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label={t('form.code')}
                                    placeholder={t('form.code_placeholder')}
                                    error={errors.code?.message}
                                />
                            )}
                        />
                        <Controller
                            name="plate"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label={t('form.plate')}
                                    placeholder={t('form.plate_placeholder')}
                                    error={errors.plate?.message}
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label={t('form.name')}
                                placeholder={t('form.name_placeholder')}
                                error={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t('form.type')}</label>
                                <select
                                    {...field}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {BUS_TYPES.map((busType) => (
                                        <option key={busType} value={busType}>{t(`bus_types.${busType}`)}</option>
                                    ))}
                                </select>
                                {errors.type ? <p className="mt-1 text-xs text-destructive">{errors.type.message}</p> : null}
                            </div>
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label={t('form.description')}
                                placeholder={t('form.description_placeholder')}
                                error={errors.description?.message}
                            />
                        )}
                    />

                    <Controller
                        name="seatLayoutId"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t('form.seat_layout')}</label>
                                <select
                                    {...field}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    disabled={isSubmitting || seatLayoutsQuery.isLoading}
                                >
                                    <option value="">{t('form.seat_layout_placeholder')}</option>
                                    {(seatLayoutsQuery.data ?? []).map((layout) => (
                                        <option key={layout.seatLayoutId} value={layout.seatLayoutId}>
                                            {layout.name || layout.seatLayoutId}
                                        </option>
                                    ))}
                                </select>
                                {seatLayoutsQuery.isLoading ? (
                                    <p className="mt-1 text-xs text-muted-foreground">{tCommon('common.loading')}</p>
                                ) : null}
                                {!seatLayoutsQuery.isLoading && (seatLayoutsQuery.data?.length ?? 0) === 0 ? (
                                    <p className="mt-1 text-xs text-muted-foreground">{t('form.seat_layout_empty')}</p>
                                ) : null}
                                {errors.seatLayoutId ? (
                                    <p className="mt-1 text-xs text-destructive">{errors.seatLayoutId.message}</p>
                                ) : null}
                            </div>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{t('form.seat_layout_preview')}</h3>
                        <p className="text-xs text-muted-foreground">{t('form.seat_layout_description')}</p>
                    </div>

                    <SeatLayoutPreview layout={selectedSeatLayout} />
                </div>
            </div>

            <div className="flex gap-2 border-t border-border pt-4">
                <Button type="submit" loading={isSubmitting}>{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    {tCommon('common.cancel')}
                </Button>
            </div>
        </form>
    )
}

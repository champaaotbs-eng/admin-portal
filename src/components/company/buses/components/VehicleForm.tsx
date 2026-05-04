import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BUS_TYPES } from '../data'
import { BusSeatLayoutBuilder } from './bus-seat-layout-builder.tsx'
import { defaultSeatLayoutValue, vehicleSchema } from '../validation-schema'
import type { VehicleFormData } from '../validation-schema'

export const VehicleForm = ({
    defaultValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: {
    defaultValues?: Partial<VehicleFormData>
    onSubmit: (data: VehicleFormData) => Promise<void> | void
    onCancel: () => void
    isSubmitting?: boolean
}) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tCommon } = useTranslation()
    const { control, handleSubmit, formState: { errors } } = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema(t)),
        defaultValues: {
            code: '',
            plate: '',
            name: '',
            type: BUS_TYPES[0],
            seatLayout: defaultSeatLayoutValue,
            description: '',
            ...defaultValues,
        },
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-rows-[1fr_auto] gap-5 h-full">
            {/* Main content: two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 overflow-y-auto">
                {/* Left column: Bus Information */}
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
                                <label className="text-sm font-medium mb-2 block">{t('form.type')}</label>
                                <select
                                    {...field}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {BUS_TYPES.map((busType) => (
                                        <option key={busType} value={busType}>{t(`bus_types.${busType}`)}</option>
                                    ))}
                                </select>
                                {errors.type ? <p className="text-xs text-destructive mt-1">{errors.type.message}</p> : null}
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
                </div>

                {/* Right column: Seat Layout */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">{t('form.seat_layout')}</h3>
                    <p className="text-xs text-muted-foreground">{t('form.seat_layout_description')}</p>

                    <Controller
                        name="seatLayout"
                        control={control}
                        render={({ field, fieldState }) => (
                            <BusSeatLayoutBuilder
                                value={field.value}
                                onChange={field.onChange}
                                isDisabled={isSubmitting}
                                errorMessage={fieldState.error?.message}
                                errors={errors.seatLayout}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Bottom: Action buttons */}
            <div className="flex gap-2 pt-4 border-t border-border">
                <Button type="submit" loading={isSubmitting}>{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

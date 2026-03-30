import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BUS_TYPES, TYPE_LABELS } from '../data'
import { vehicleSchema, type VehicleFormData } from '../validation-schema'

export const VehicleForm = ({
    defaultValues,
    onSubmit,
    onCancel,
}: {
    defaultValues?: Partial<VehicleFormData>
    onSubmit: (data: VehicleFormData) => void
    onCancel: () => void
}) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.fleet' })
    const { t: tCommon } = useTranslation()
    const { control, handleSubmit, formState: { errors } } = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema(t)),
        defaultValues: { plate: '', name: '', type: 'seat', seats: '', ...defaultValues },
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
                <Controller name="plate" control={control} render={({ field }) => (
                    <Input {...field} label={t('plate_number')} placeholder="51B-12345" error={errors.plate?.message} />
                )} />
                <Controller name="seats" control={control} render={({ field }) => (
                    <Input {...field} label={t('total_seats')} type="number" placeholder="45" error={errors.seats?.message} />
                )} />
            </div>
            <Controller name="name" control={control} render={({ field }) => (
                <Input {...field} label={t('bus_name')} placeholder="Xe 45 chỗ Phương Trang" error={errors.name?.message} />
            )} />
            <Controller name="type" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('bus_type')}</label>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        {BUS_TYPES.map(bt => <option key={bt} value={bt}>{TYPE_LABELS[bt]}</option>)}
                    </select>
                    {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
                </div>
            )} />
            <div className="flex gap-2">
                <Button type="submit">{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

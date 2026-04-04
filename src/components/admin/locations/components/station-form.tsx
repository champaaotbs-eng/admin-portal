import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { stationSchema, type StationFormData } from '../validation-schema'
import type { IProvince } from 'types/province'

interface StationFormProps {
    provinces: IProvince[]
    onSubmit: (data: StationFormData) => Promise<void> | void
    onCancel: () => void
    isSubmitting?: boolean
}

export const StationForm = ({ provinces, onSubmit, onCancel, isSubmitting = false }: StationFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.locations' })
    const { t: tCommon } = useTranslation()
    const { control, handleSubmit, formState: { errors } } = useForm<StationFormData>({
        resolver: zodResolver(stationSchema(t)),
        mode: 'onChange',
        defaultValues: {
            name: '',
            address: '',
            province: '',
            lat: '',
            lng: '',
        },
    })

    return (
        <form onSubmit={handleSubmit(async (values) => { await onSubmit(values) })} className="grid gap-4 sm:grid-cols-2">
            <Controller name="name" control={control} render={({ field }) => (
                <Input {...field} label={t('form_station.name')} placeholder={t('form_station.name_placeholder')} className="sm:col-span-2" error={errors.name?.message} />
            )} />
            <Controller name="address" control={control} render={({ field }) => (
                <Input {...field} label={t('form_station.address')} placeholder={t('form_station.address_placeholder')} className="sm:col-span-2" error={errors.address?.message} />
            )} />
            <Controller name="province" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('form_station.province')}</label>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">{t('form_station.province')}</option>
                        {provinces.map((province) => <option key={province.provinceId} value={province.provinceId}>{province.name}</option>)}
                    </select>
                    {errors.province && <p className="text-xs text-destructive mt-1">{errors.province.message}</p>}
                </div>
            )} />
            <div className="grid grid-cols-2 gap-2">
                <Controller name="lat" control={control} render={({ field }) => (
                    <Input {...field} label={t('form_station.lat')} placeholder="10.8190" error={errors.lat?.message} />
                )} />
                <Controller name="lng" control={control} render={({ field }) => (
                    <Input {...field} label={t('form_station.lng')} placeholder="106.7040" error={errors.lng?.message} />
                )} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={isSubmitting}>{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

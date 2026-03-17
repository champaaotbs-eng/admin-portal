import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { stationSchema, type StationFormData } from '../validation-schema'
import { provinces } from '../data'

interface StationFormProps {
    onSubmit: (data: StationFormData) => void
    onCancel: () => void
}

export const StationForm = ({ onSubmit, onCancel }: StationFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.locations' })
    const { t: tCommon } = useTranslation()
    const { control, handleSubmit, formState: { errors } } = useForm<StationFormData>({
        resolver: zodResolver(stationSchema(t)),
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Controller name="name" control={control} render={({ field }) => (
                <Input {...field} label={t('station_name')} placeholder="Bến xe Miền Đông" className="sm:col-span-2" error={errors.name?.message} />
            )} />
            <Controller name="address" control={control} render={({ field }) => (
                <Input {...field} label={t('address')} placeholder="292 Đinh Bộ Lĩnh, Q. Bình Thạnh" className="sm:col-span-2" error={errors.address?.message} />
            )} />
            <Controller name="province" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('province')}</label>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">{t('select_province')}</option>
                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {errors.province && <p className="text-xs text-destructive mt-1">{errors.province.message}</p>}
                </div>
            )} />
            <div className="grid grid-cols-2 gap-2">
                <Controller name="lat" control={control} render={({ field }) => (
                    <Input {...field} label={t('latitude')} placeholder="10.8190" error={errors.lat?.message} />
                )} />
                <Controller name="lng" control={control} render={({ field }) => (
                    <Input {...field} label={t('longitude')} placeholder="106.7040" error={errors.lng?.message} />
                )} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { routeSchema, type RouteFormData } from '../validation-schema'
import { locations } from '../data'

interface RouteFormProps {
    onSubmit: (data: RouteFormData) => void
    onCancel: () => void
}

export const RouteForm = ({ onSubmit, onCancel }: RouteFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.locations' })
    const { t: tCommon } = useTranslation()
    const { control, handleSubmit, formState: { errors } } = useForm<RouteFormData>({
        resolver: zodResolver(routeSchema(t)),
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Controller name="from" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('departure')}</label>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">{t('select_station')}</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.provinceName})</option>)}
                    </select>
                    {errors.from && <p className="text-xs text-destructive mt-1">{errors.from.message}</p>}
                </div>
            )} />
            <Controller name="to" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('destination')}</label>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">{t('select_station')}</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.provinceName})</option>)}
                    </select>
                    {errors.to && <p className="text-xs text-destructive mt-1">{errors.to.message}</p>}
                </div>
            )} />
            <div className="grid grid-cols-2 gap-3">
                <Controller name="distance" control={control} render={({ field }) => (
                    <Input {...field} label={t('distance_km')} type="number" placeholder="300" error={errors.distance?.message} />
                )} />
                <Controller name="duration" control={control} render={({ field }) => (
                    <Input {...field} label={t('duration_minutes')} type="number" placeholder="360" error={errors.duration?.message} />
                )} />
            </div>
            <div className="flex gap-2">
                <Button type="submit">{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_ROUTES, MOCK_BUSES } from '../data'
import { tripSchema, type TripFormData } from '../validation-schema'

export const TripForm = ({ onSubmit, onCancel }: { onSubmit: (data: TripFormData) => void; onCancel: () => void }) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.trips' })
    const { t: tCommon } = useTranslation()
    const { control, handleSubmit, formState: { errors } } = useForm<TripFormData>({
        resolver: zodResolver(tripSchema(t)),
        defaultValues: { route: '', departure: '', arrival: '', bus: '', driver: '', price: '', seats: '' },
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Controller name="route" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('route')}</label>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">{t('select_route')}</option>
                        {MOCK_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.route && <p className="text-xs text-destructive mt-1">{errors.route.message}</p>}
                </div>
            )} />
            <div className="grid grid-cols-2 gap-3">
                <Controller name="departure" control={control} render={({ field }) => (
                    <Input {...field} label={t('departure_time')} type="datetime-local" error={errors.departure?.message} />
                )} />
                <Controller name="arrival" control={control} render={({ field }) => (
                    <Input {...field} label={t('arrival_time')} type="datetime-local" error={errors.arrival?.message} />
                )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Controller name="bus" control={control} render={({ field }) => (
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t('bus')}</label>
                        <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                            <option value="">{t('select_bus')}</option>
                            {MOCK_BUSES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                        </select>
                        {errors.bus && <p className="text-xs text-destructive mt-1">{errors.bus.message}</p>}
                    </div>
                )} />
                <Controller name="price" control={control} render={({ field }) => (
                    <Input {...field} label={t('ticket_price')} type="number" placeholder="220000" error={errors.price?.message} />
                )} />
            </div>
            <div className="flex gap-2">
                <Button type="submit">{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

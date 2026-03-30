import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COMPANY_ROLES } from '../data'
import { staffSchema, staffCreateSchema, type StaffFormData } from '../validation-schema'

export const StaffForm = ({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
}: {
    mode: 'create' | 'edit'
    defaultValues?: Partial<StaffFormData>
    onSubmit: (data: StaffFormData) => void
    onCancel: () => void
}) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.staff' })
    const { t: tCommon } = useTranslation()
    const schema = mode === 'create' ? staffCreateSchema(t) : staffSchema(t)
    const { control, handleSubmit, formState: { errors } } = useForm<StaffFormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', email: '', phone: '', role: 'driver', password: '', ...defaultValues },
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Controller name="name" control={control} render={({ field }) => (
                <Input {...field} label={t('form.name')} placeholder={t('form.name_placeholder')} error={errors.name?.message} />
            )} />
            <div className="grid grid-cols-2 gap-3">
                <Controller name="email" control={control} render={({ field }) => (
                    <Input {...field} label={t('form.email')} type="email" placeholder={t('form.email_placeholder')} error={errors.email?.message} />
                )} />
                <Controller name="phone" control={control} render={({ field }) => (
                    <Input {...field} label={t('form.phone')} placeholder={t('form.phone_placeholder')} error={errors.phone?.message} />
                )} />
            </div>
            <Controller name="role" control={control} render={({ field }) => (
                <div>
                    <label className="text-sm font-medium mb-1 block">{t('form.role')}</label>
                    <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        {COMPANY_ROLES.filter(r => r !== 'owner').map(r => (
                            <option key={r} value={r}>{t(`roles.${r}`)}</option>
                        ))}
                    </select>
                    {errors.role && <p className="text-xs text-destructive mt-1">{errors.role.message}</p>}
                </div>
            )} />
            {mode === 'create' && (
                <Controller name="password" control={control} render={({ field }) => (
                    <Input {...field} label={t('form.password')} type="password" placeholder="••••••••" error={errors.password?.message} />
                )} />
            )}
            <div className="flex gap-2">
                <Button type="submit">{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

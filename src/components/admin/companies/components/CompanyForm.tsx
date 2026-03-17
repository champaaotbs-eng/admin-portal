import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { companySchema, companyCreateSchema, type CompanyFormData } from '../validation-schema'

interface CompanyFormProps {
    defaultValues: CompanyFormData
    onSubmit: (d: CompanyFormData) => void
    onCancel: () => void
    isSaving: boolean
    mode: 'create' | 'edit'
}

export const CompanyForm = ({ defaultValues, onSubmit, onCancel, isSaving, mode }: CompanyFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const { t: tCommon } = useTranslation()
    const schema = mode === 'create' ? companyCreateSchema(t) : companySchema(t)
    const { control, handleSubmit, formState: { errors } } = useForm<CompanyFormData>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Controller control={control} name="name"
                render={({ field }) => <Input label={t('company_name')} placeholder={t('company_name_placeholder')} {...field} error={errors.name?.message} />} />
            <Controller control={control} name="email"
                render={({ field }) => <Input label={t('email')} type="email" placeholder={t('email_placeholder')} {...field} error={errors.email?.message} />} />
            <Controller control={control} name="phone"
                render={({ field }) => <Input label={t('phone')} placeholder={t('phone_placeholder')} {...field} error={errors.phone?.message} />} />
            <Controller control={control} name="serviceFee"
                render={({ field }) => <Input label={t('service_fee')} type="number" placeholder="5" {...field} error={errors.serviceFee?.message} />} />
            <Controller control={control} name="address"
                render={({ field }) => <Input label={t('address')} placeholder={t('address_placeholder')} {...field} error={errors.address?.message} className="sm:col-span-2" />} />
            {mode === 'create' && (
                <>
                    <div className="sm:col-span-2 border-t border-border pt-4">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {t('owner_section')}
                        </p>
                    </div>
                    <Controller control={control} name="ownerUsername"
                        render={({ field }) => <Input label={t('owner_username')} placeholder="owner_username" {...field} error={errors.ownerUsername?.message} />} />
                    <Controller control={control} name="ownerPassword"
                        render={({ field }) => <Input label={t('owner_password')} type="password" placeholder="••••••" {...field} error={errors.ownerPassword?.message} />} />
                </>
            )}
            <div className="flex gap-2 sm:col-span-2 pt-2">
                <Button type="submit" loading={isSaving}>{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

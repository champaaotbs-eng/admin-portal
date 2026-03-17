import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { roleSchema, type RoleFormData } from '../validation-schema'

interface RoleFormProps {
    defaultValues: RoleFormData
    onSubmit: (data: RoleFormData) => void
    onCancel: () => void
    isSaving: boolean
}

export const RoleForm = ({ defaultValues, onSubmit, onCancel, isSaving }: RoleFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })
    const { t: tCommon } = useTranslation()
    const { control, handleSubmit, formState: { errors } } = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema(t)),
        defaultValues,
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
                control={control}
                name="name"
                render={({ field }) => (
                    <Input label={t('form.name')} placeholder={t('form.name_placeholder')} {...field} error={errors.name?.message} />
                )}
            />
            <Controller
                control={control}
                name="description"
                render={({ field }) => (
                    <Input label={t('form.description')} placeholder={t('form.description_placeholder')} {...field} />
                )}
            />
            <div className="flex gap-2">
                <Button type="submit" loading={isSaving}>{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('common.cancel')}</Button>
            </div>
        </form>
    )
}

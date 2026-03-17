import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ROLE_I18N_KEYS } from '@/constants/roles'
import { RoleEnum } from 'types/role'
import { userSchema, userCreateSchema, type UserFormData } from '../validation-schema'

interface UserFormProps {
    defaultValues: UserFormData
    onSubmit: (data: UserFormData) => void
    onCancel: () => void
    isSaving: boolean
    mode: 'create' | 'edit'
}

export const UserForm = ({ defaultValues, onSubmit, onCancel, isSaving, mode }: UserFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.users' })
    const { t: tCommon } = useTranslation()
    const schema = mode === 'create' ? userCreateSchema(t) : userSchema(t)
    const { control, handleSubmit, formState: { errors } } = useForm<UserFormData>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Controller
                control={control}
                name="name"
                render={({ field }) => (
                    <Input label={t('form.name')} placeholder={t('form.name_placeholder')} {...field} error={errors.name?.message} />
                )}
            />
            <Controller
                control={control}
                name="username"
                render={({ field }) => (
                    <Input label={t('form.username')} placeholder={t('form.username_placeholder')} {...field} error={errors.username?.message} />
                )}
            />
            <Controller
                control={control}
                name="email"
                render={({ field }) => (
                    <Input label={t('form.email')} type="email" placeholder={t('form.email_placeholder')} {...field} error={errors.email?.message} />
                )}
            />
            <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                    <Input label={t('form.phone')} placeholder={t('form.phone_placeholder')} {...field} />
                )}
            />
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium leading-none">{t('form.role')}</label>
                <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                        <select
                            {...field}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {Object.values(RoleEnum).map((r) => (
                                <option key={r} value={r}>
                                    {tCommon(`roles.${ROLE_I18N_KEYS[r]}`)}
                                </option>
                            ))}
                        </select>
                    )}
                />
            </div>
            {mode === 'create' && (
                <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                        <Input label={t('form.password')} type="password" placeholder="••••••" {...field} error={errors.password?.message} />
                    )}
                />
            )}
            <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" loading={isSaving}>
                    {tCommon('common.save')}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    {tCommon('common.cancel')}
                </Button>
            </div>
        </form>
    )
}

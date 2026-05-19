import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { IRole } from 'types/role'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { staffSchema, type StaffFormData } from '../validation-schema'

interface StaffFormProps {
    mode: 'create' | 'edit'
    roles: IRole[]
    defaultValues?: Partial<StaffFormData>
    onSubmit: (data: StaffFormData) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export const StaffForm = ({
    mode,
    roles,
    defaultValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: StaffFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.staff' })
    const { t: tCommon } = useTranslation()
    const isEditMode = mode === 'edit'
    const schema = staffSchema(t, isEditMode)

    const { control, handleSubmit, formState: { errors } } = useForm<StaffFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: '',
            fullName: '',
            roleId: roles[0]?.roleId ?? '',
            password: '',
            isActive: true,
            ...defaultValues,
        },
        mode: 'onChange',
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Controller
                name="username"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label={t('form.username')}
                        placeholder={t('form.username_placeholder')}
                        error={errors.username?.message}
                    />
                )}
            />

            <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label={t('form.name')}
                        placeholder={t('form.name_placeholder')}
                        error={errors.fullName?.message}
                    />
                )}
            />

            <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                    <div>
                        <label className="mb-1 block text-sm font-medium">{t('form.role')}</label>
                        <select
                            {...field}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">{t('form.role_placeholder')}</option>
                            {roles.map((role) => (
                                <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
                            ))}
                        </select>
                        {errors.roleId ? <p className="mt-1 text-xs text-destructive">{errors.roleId.message}</p> : null}
                    </div>
                )}
            />

            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label={t('form.password')}
                        type="password"
                        placeholder={t('form.password_placeholder')}
                        error={errors.password?.message}
                    />
                )}
            />

            <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                            className="h-4 w-4 rounded border-input"
                        />
                        {t('form.active')}
                    </label>
                )}
            />

            <div className="flex gap-2">
                <Button type="submit" loading={isSubmitting}>{tCommon('common.save')}</Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    {tCommon('common.cancel')}
                </Button>
            </div>
        </form>
    )
}

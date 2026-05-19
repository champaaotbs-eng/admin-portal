import { Lock } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ToggleSwitch } from 'components/shared/toggle-switch'
import { LoadingSpinner } from 'components/shared/loading-spinner'
import { AdminPasswordField } from '../components/admin-password-field.component'
import { useAdminForm } from '../hooks/use-admin-form.hook'

interface AdminEditPageProps {
    adminId: string
}

/**
 * Edit existing admin page.
 */
export const AdminEditPage = ({ adminId }: AdminEditPageProps) => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })
    const {
        form,
        isLoadingAdmin,
        roles,
        isLoadingRoles,
        selectedRole,
        formatRoleOptionLabel,
        showPassword,
        showConfirmPassword,
        toggleShowPassword,
        toggleShowConfirmPassword,
        onSubmit,
        isSubmitting,
    } = useAdminForm({ adminId })

    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = form

    const isActive = watch('isActive')

    if (isLoadingAdmin) {
        return <LoadingSpinner />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{t('page.edit_title')}</h1>
                <Button variant="outline" onClick={() => navigate({ to: '/admin/admins' })}>
                    {t('actions.back_to_list')}
                </Button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.username')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        disabled
                                        className="h-10 w-full rounded-md border border-slate-300 bg-[#f5f5f5] px-3 pr-10 text-sm text-slate-600 outline-none"
                                        {...register('username')}
                                    />
                                    <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{t('form.cannot_edit')}</p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.full_name')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        disabled
                                        className="h-10 w-full rounded-md border border-slate-300 bg-[#f5f5f5] px-3 pr-10 text-sm text-slate-600 outline-none"
                                        {...register('fullName')}
                                    />
                                    <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{t('form.cannot_edit')}</p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.role')} <span className="text-rose-500">*</span></label>
                                <select
                                    disabled={isSubmitting || isLoadingRoles}
                                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-[#f5f5f5]"
                                    {...register('roleId')}
                                >
                                    <option value="">{t('form.role_placeholder')}</option>
                                    {roles.map((role) => (
                                        <option key={role.roleId} value={role.roleId}>{formatRoleOptionLabel(role)}</option>
                                    ))}
                                </select>
                                {errors.roleId ? <p className="mt-1 text-xs text-rose-600">{errors.roleId.message}</p> : null}
                                {selectedRole ? (
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formatRoleOptionLabel(selectedRole)}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="space-y-5">
                            <AdminPasswordField
                                id="edit-admin-password"
                                label={t('form.password')}
                                value={watch('password')}
                                onChange={(value) => setValue('password', value, { shouldDirty: true, shouldValidate: true })}
                                visible={showPassword}
                                onToggleVisibility={toggleShowPassword}
                                placeholder={t('form.password_placeholder')}
                                error={errors.password?.message}
                                helperText={t('form.password_note_edit')}
                                disabled={isSubmitting}
                            />

                            <AdminPasswordField
                                id="edit-admin-confirm-password"
                                label={t('form.confirm_password')}
                                value={watch('confirmPassword')}
                                onChange={(value) => setValue('confirmPassword', value, { shouldDirty: true, shouldValidate: true })}
                                visible={showConfirmPassword}
                                onToggleVisibility={toggleShowConfirmPassword}
                                placeholder={t('form.confirm_password_placeholder')}
                                error={errors.confirmPassword?.message}
                                disabled={isSubmitting}
                            />

                            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-sm font-medium text-slate-800">{t('form.active')}</span>
                                <ToggleSwitch
                                    checked={Boolean(isActive)}
                                    onChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/admins' })} disabled={isSubmitting}>
                        {t('actions.cancel')}
                    </Button>
                    <Button type="submit" loading={isSubmitting}>
                        {t('actions.save')}
                    </Button>
                </div>
            </form>
        </div>
    )
}

import { Lock } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ToggleSwitch } from 'components/shared/toggle-switch'
import { AdminPasswordField } from '../components/admin-password-field.component'
import { useAdminForm } from '../hooks/use-admin-form.hook'

/**
 * Add new admin page.
 */
export const AdminAddPage = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })
    const {
        form,
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
    } = useAdminForm({})

    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = form

    const isActive = watch('isActive')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{t('page.add_title')}</h1>
                <Button variant="outline" onClick={() => navigate({ to: '/admin/admins' })}>
                    {t('actions.back_to_list')}
                </Button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.username')} <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder={t('form.username_placeholder')}
                                    disabled={isSubmitting}
                                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    {...register('username')}
                                />
                                {errors.username ? <p className="mt-1 text-xs text-rose-600">{errors.username.message}</p> : null}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.full_name')} <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder={t('form.full_name_placeholder')}
                                    disabled={isSubmitting}
                                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    {...register('fullName')}
                                />
                                {errors.fullName ? <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p> : null}
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
                                id="admin-password"
                                label={t('form.password')}
                                value={watch('password')}
                                onChange={(value) => setValue('password', value, { shouldDirty: true, shouldValidate: true })}
                                visible={showPassword}
                                onToggleVisibility={toggleShowPassword}
                                placeholder={t('form.password_placeholder')}
                                error={errors.password?.message}
                                disabled={isSubmitting}
                                required
                            />

                            <AdminPasswordField
                                id="admin-confirm-password"
                                label={t('form.confirm_password')}
                                value={watch('confirmPassword')}
                                onChange={(value) => setValue('confirmPassword', value, { shouldDirty: true, shouldValidate: true })}
                                visible={showConfirmPassword}
                                onToggleVisibility={toggleShowConfirmPassword}
                                placeholder={t('form.confirm_password_placeholder')}
                                error={errors.confirmPassword?.message}
                                disabled={isSubmitting}
                                required
                            />

                            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-sm font-medium text-slate-800">{t('form.active')}</span>
                                <ToggleSwitch
                                    checked={Boolean(isActive)}
                                    onChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                                <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> {t('form.password_note_create')}</span>
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

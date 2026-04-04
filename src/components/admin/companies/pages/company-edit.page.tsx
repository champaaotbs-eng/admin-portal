import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from 'components/shared/confirmation-modal'
import { CompanyLogoUpload } from '../components/company-logo-upload.component'
import { CompanyAdminRow } from '../components/company-admin-row.component'
import { useCompanyForm } from '../hooks/use-company-form.hook'

interface CompanyEditPageProps {
    companyId: string
}

/**
 * Edit bus company page.
 */
export const CompanyEditPage = ({ companyId }: CompanyEditPageProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const navigate = useNavigate()
    const {
        form,
        isLoadingCompany,
        isLoadingAdmins,
        existingAdmins,
        removeExistingAdmin,
        pendingFields,
        appendPendingAdmin,
        removePendingAdmin,
        logoPreviewUrl,
        logoFile,
        existingLogoUrl,
        logoError,
        handleLogoSelect,
        handleLogoRemove,
        availableAdmins,
        onSubmit,
        isSubmitting,
        toast,
        setToast,
    } = useCompanyForm({ companyId })

    const {
        register,
        formState: { errors },
    } = form

    const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

    useEffect(() => {
        if (!toast) return
        const timer = window.setTimeout(() => setToast(null), 3000)
        return () => window.clearTimeout(timer)
    }, [setToast, toast])

    if (isLoadingCompany) {
        return (
            <div className="space-y-4">
                <div className="h-10 w-60 animate-pulse rounded bg-slate-200" />
                <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {toast ? (
                <div className="fixed right-4 top-4 z-50">
                    <div className={[
                        'rounded-md border px-4 py-3 text-sm shadow-md',
                        toast.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700',
                    ].join(' ')}>{toast.message}</div>
                </div>
            ) : null}

            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{t('edit_company_form_title')}</h1>
                <Button variant="outline" onClick={() => navigate({ to: '/admin/companies' })}>{t('form.back_to_list')}</Button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">{t('form.company_information')}</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.name')} <span className="text-rose-500">*</span></label>
                            <input {...register('name')} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                            {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p> : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.email')}</label>
                            <input {...register('email')} type="email" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                            {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.phone')}</label>
                            <input {...register('phone')} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                            {errors.phone ? <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p> : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.service_fee')} <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <input
                                    {...register('serviceFee', { valueAsNumber: true })}
                                    type="number"
                                    min={0}
                                    max={100}
                                    className="h-10 w-full rounded-md border border-slate-300 px-3 pr-8 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
                            </div>
                            {errors.serviceFee ? <p className="mt-1 text-xs text-rose-600">{errors.serviceFee.message}</p> : null}
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.address')}</label>
                            <textarea {...register('address')} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-800">{t('form.status')} <span className="text-rose-500">*</span></label>
                            <select {...register('status')} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
                                <option value="ACTIVE">{t('status_active')}</option>
                                <option value="INACTIVE">{t('status_inactive')}</option>
                                <option value="SUSPENDED">{t('status_suspended')}</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <CompanyLogoUpload
                                currentLogoUrl={existingLogoUrl ?? undefined}
                                previewUrl={logoPreviewUrl}
                                fileName={logoFile?.name}
                                fileSizeLabel={logoFile ? `${(logoFile.size / 1024 / 1024).toFixed(2)} MB` : undefined}
                                onFileSelect={handleLogoSelect}
                                onRemove={handleLogoRemove}
                                error={logoError}
                            />
                        </div>

                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">{t('form.assigned_admins')}</h2>

                    <div className="space-y-2">
                        {existingAdmins.map((admin) => {
                            const initials = admin.fullName
                                .split(' ')
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((segment) => segment[0]?.toUpperCase())
                                .join('')

                            return (
                                <div key={admin.adminId} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{admin.fullName}</p>
                                            <p className="text-xs text-slate-500">{admin.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                                            {admin.position === 'owner' ? t('detail_position_owner') : t('detail_position_staff')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmRemoveId(admin.adminId)}
                                            className="text-sm text-rose-600 transition hover:underline"
                                        >
                                            {t('form.remove')}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {existingAdmins.length === 0 ? <p className="text-sm text-slate-500">{t('form.no_assigned_admins')}</p> : null}
                    </div>

                    <div className="mt-4 space-y-3">
                        {pendingFields.map((field, index) => (
                            <CompanyAdminRow
                                key={field.id}
                                index={index}
                                adminOptions={availableAdmins}
                                control={form.control}
                                onRemove={() => removePendingAdmin(index)}
                                isLoadingAdmins={isLoadingAdmins}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={appendPendingAdmin}
                        className="mt-4 text-sm font-medium text-blue-600 transition hover:underline"
                    >
                        {`+ ${t('form.add_admin')}`}
                    </button>
                </section>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/companies' })} disabled={isSubmitting}>{t('form.cancel')}</Button>
                    <Button type="submit" loading={isSubmitting}>{t('form.save')}</Button>
                </div>
            </form>

            <ConfirmationModal
                open={Boolean(confirmRemoveId)}
                onClose={() => setConfirmRemoveId(null)}
                title={t('form.remove_admin_title')}
                description={t('form.remove_admin_confirm')}
                confirmLabel={t('form.remove')}
                cancelLabel={t('form.cancel')}
                destructive
                onConfirm={() => {
                    if (!confirmRemoveId) return
                    removeExistingAdmin(confirmRemoveId)
                    setConfirmRemoveId(null)
                }}
            />
        </div>
    )
}

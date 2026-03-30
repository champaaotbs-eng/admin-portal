import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CompanyLogoUpload } from '../components/company-logo-upload.component'
import { CompanyAdminRow } from '../components/company-admin-row.component'
import { useCompanyForm } from '../hooks/use-company-form.hook'

/**
 * Add new bus company page.
 */
export const CompanyAddPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const navigate = useNavigate()
    const {
        form,
        allAdmins,
        isLoadingAdmins,
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
    } = useCompanyForm({})

    const {
        register,
        watch,
        formState: { errors },
    } = form

    useEffect(() => {
        if (!toast) return
        const timer = window.setTimeout(() => setToast(null), 3000)
        return () => window.clearTimeout(timer)
    }, [setToast, toast])

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
                <h1 className="text-2xl font-bold text-slate-900">{t('add_company_title')}</h1>
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
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">{t('form.assigned_admins')}</h2>
                    <div className="space-y-3">
                        {pendingFields.map((field, index) => (
                            <CompanyAdminRow
                                key={field.id}
                                index={index}
                                adminOptions={availableAdmins.length > 0 ? availableAdmins : allAdmins}
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
                        {`+ ${t('form.add_another_admin')}`}
                    </button>
                </section>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/companies' })} disabled={isSubmitting}>{t('form.cancel')}</Button>
                    <Button type="submit" loading={isSubmitting}>{t('form.save')}</Button>
                </div>
            </form>
        </div>
    )
}

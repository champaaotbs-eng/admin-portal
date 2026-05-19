import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { IAdmin } from 'types/admin'

interface PendingAdminRowProps {
    adminOptions: IAdmin[]
    control: Control<any>
    onSelectionChange?: () => void
    isLoadingAdmins: boolean
}

/**
 * Render one pending assigned-admin row for company form.
 */
export const CompanyAdminRow = ({
    adminOptions,
    control,
    onSelectionChange,
    isLoadingAdmins,
}: PendingAdminRowProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies.form' })

    return (
        <div className="space-y-3">
            <Controller
                name="companyAdmins.0.adminId"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-slate-800">
                            {t('owner_admin')} <span className="text-rose-500">*</span>
                        </label>
                        <select
                            {...field}
                            onChange={(event) => {
                                field.onChange(event)
                                onSelectionChange?.()
                            }}
                            disabled={isLoadingAdmins}
                            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">{t('select_admin')}</option>
                            {adminOptions.map((admin) => (
                                <option key={admin.adminId} value={admin.adminId}>
                                    {admin.fullName} ({admin.username ?? '—'})
                                </option>
                            ))}
                        </select>
                        {fieldState.error ? <p className="mt-1 text-xs text-rose-600">{fieldState.error.message}</p> : null}
                    </div>
                )}
            />

            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {t('owner_admin_hint')}
            </div>
        </div>
    )
}

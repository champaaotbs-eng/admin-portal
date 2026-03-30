import { useNavigate } from '@tanstack/react-router'
import { Building2, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { CompanyStatusBadge } from './company-status-badge.component'
import { useCompanyDetail } from '../hooks/use-company-detail.hook'

interface CompanyDetailModalProps {
    companyId: string | null
    open: boolean
    onClose: () => void
}

/**
 * Detail modal for bus company information and assigned admins.
 */
export const CompanyDetailModal = ({ companyId, open, onClose }: CompanyDetailModalProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const navigate = useNavigate()
    const { company, isLoading, isError, refetch } = useCompanyDetail(companyId)

    return (
        <Dialog open={open} onClose={onClose} title={t('detail.title')} className="max-w-2xl">
            {isLoading ? (
                <div className="space-y-4">
                    <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-14 animate-pulse rounded bg-slate-100" />
                        ))}
                    </div>
                </div>
            ) : isError ? (
                <div className="space-y-3">
                    <p className="text-sm text-rose-600">{t('detail.load_failed')}</p>
                    <Button type="button" variant="outline" onClick={() => refetch()}>
                        <RefreshCcw className="mr-1 h-4 w-4" /> {t('detail.retry')}
                    </Button>
                </div>
            ) : company ? (
                <div className="space-y-5">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-start gap-4">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.name} className="h-20 w-20 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                    <Building2 className="h-8 w-8" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-semibold text-slate-900">{company.name}</h3>
                                    <CompanyStatusBadge status={company.status} />
                                </div>
                                <p className="text-xs text-slate-500">
                                    {t('detail.created_at')}: {new Date(company.createdAt).toLocaleDateString('en-GB')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-md border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{t('detail_info_email')}</p><p className="text-sm text-slate-800">{company.email ?? '—'}</p></div>
                        <div className="rounded-md border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{t('detail_info_phone')}</p><p className="text-sm text-slate-800">{company.phone ?? '—'}</p></div>
                        <div className="rounded-md border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{t('detail_info_address')}</p><p className="text-sm text-slate-800">{company.address ?? '—'}</p></div>
                        <div className="rounded-md border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{t('detail_info_fee')}</p><p className="text-sm text-slate-800">{company.serviceFee}%</p></div>
                    </div>

                    <section className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-900">{t('form.assigned_admins')}</h4>
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                {((company as { admins?: unknown[] }).admins ?? []).length}
                            </span>
                        </div>

                        {((company as { admins?: Array<{ adminId: string; fullName: string; username: string; position: string }> }).admins ?? []).length > 0 ? (
                            <div className="space-y-2">
                                {((company as { admins?: Array<{ adminId: string; fullName: string; username: string; position: string }> }).admins ?? []).map((admin) => {
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
                                            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">{admin.position}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">{t('form.no_assigned_admins')}</p>
                        )}
                    </section>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>{t('detail.close')}</Button>
                        <Button
                            type="button"
                            onClick={() => {
                                onClose()
                                navigate({ to: `/admin/companies/${company.busCompanyId}` })
                            }}
                        >
                            {t('detail.edit_company')}
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-slate-600">{t('detail.no_company_selected')}</p>
            )}
        </Dialog>
    )
}

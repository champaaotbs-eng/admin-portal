import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAdminDetail } from '../hooks/use-admin-detail.hook'
import { AdminStatusBadge } from './admin-status-badge.component'

interface AdminDetailModalProps {
    adminId: string | null
    open: boolean
    onClose: () => void
    onEdit: (adminId: string) => void
}

/**
 * Admin detail modal with role permissions overview.
 */
export const AdminDetailModal = ({ adminId, open, onClose, onEdit }: AdminDetailModalProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })
    const { admin, mappedPermissions, isLoading } = useAdminDetail(adminId)

    const initials = admin?.fullName
        ? admin.fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('')
        : 'AD'

    return (
        <Dialog open={open} onClose={onClose} title={t('detail.title')} className="max-w-3xl">
            {isLoading ? (
                <div className="space-y-3">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
                    <div className="h-40 animate-pulse rounded bg-slate-100" />
                </div>
            ) : admin ? (
                <div className="space-y-5">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {initials}
                        </div>
                        <div className="space-y-2">
                            <div className="grid gap-1 text-sm text-slate-700">
                                <p><span className="font-medium">{t('detail.username')}:</span> {admin.username ?? '—'}</p>
                                <p><span className="font-medium">{t('detail.full_name')}:</span> {admin.fullName}</p>
                                <p><span className="font-medium">{t('detail.role')}:</span> {admin.role?.roleName ?? '—'}</p>
                                <p className="flex items-center gap-2"><span className="font-medium">{t('detail.status')}:</span> <AdminStatusBadge isActive={(admin as { isActive?: boolean }).isActive ?? true} /></p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-md border border-slate-200">
                        <div className="grid grid-cols-[minmax(0,1fr)_90px_90px] items-center bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <span>{t('detail.permissions.module')}</span>
                            <span className="text-center">{t('detail.permissions.read')}</span>
                            <span className="text-center">{t('detail.permissions.write')}</span>
                        </div>
                        {mappedPermissions.map((permission, index) => (
                            <div
                                key={permission.module}
                                className={[
                                    'grid grid-cols-[minmax(0,1fr)_90px_90px] items-center px-4 py-3 text-[13px]',
                                    index % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white',
                                ].join(' ')}
                            >
                                <span className="font-medium text-slate-800">{permission.label}</span>
                                <span className="text-center text-base">{permission.read ? '✅' : '❌'}</span>
                                <span className="text-center text-base">{permission.hasWrite ? (permission.write ? '✅' : '❌') : '—'}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('actions.close')}
                        </Button>
                        <Button type="button" onClick={() => admin.adminId && onEdit(admin.adminId)}>
                            {t('actions.edit_admin')}
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-slate-600">{t('detail.not_found')}</p>
            )}
        </Dialog>
    )
}

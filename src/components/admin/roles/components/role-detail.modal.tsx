import { useTranslation } from 'react-i18next'
import type { IRole } from 'types/role'
import { Button } from 'components/ui/button'
import { Dialog } from 'components/ui/dialog'
import { getPermissionModulesByRoleType } from '../constants/permission.constant'
import { RoleStatusBadge } from './role-status-badge.component'

interface RoleDetailModalProps {
    open: boolean
    role: IRole | null
    onClose: () => void
    onEdit: (role: IRole) => void
}

export const RoleDetailModal = ({ open, role, onClose, onEdit }: RoleDetailModalProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })

    if (!role) return null

    const permissionModules = getPermissionModulesByRoleType(role.type)

    return (
        <Dialog open={open} onClose={onClose} title={t('detail.title')} className="max-w-3xl">
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{role.roleName}</h2>
                        <p className="mt-1 text-sm text-slate-600">{role.description}</p>
                    </div>
                    <RoleStatusBadge isActive={role.isActive} />
                </div>

                <div className="overflow-hidden rounded-md border border-slate-200">
                    <div className="grid grid-cols-[minmax(0,1fr)_90px_90px] items-center bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span>{t('detail.module')}</span>
                        <span className="text-center">{t('detail.read')}</span>
                        <span className="text-center">{t('detail.write')}</span>
                    </div>
                    {permissionModules.map((moduleConfig, index) => {
                        const matched = role.permissions?.find((permission) => permission.module === moduleConfig.module)
                        const read = matched?.read ?? false
                        const write = matched?.write ?? false

                        return (
                            <div
                                key={moduleConfig.module}
                                className={[
                                    'grid grid-cols-[minmax(0,1fr)_90px_90px] items-center px-4 py-3 text-[13px]',
                                    index % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white',
                                ].join(' ')}
                            >
                                <span className="font-medium text-slate-800">{t(`modules.${moduleConfig.module}`)}</span>
                                <span className="text-center text-base">{read ? '✅' : '❌'}</span>
                                <span className="text-center text-base">{moduleConfig.hasWrite ? (write ? '✅' : '❌') : '—'}</span>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t('actions.close')}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onEdit(role)
                        }}
                    >
                        {t('actions.edit_role')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

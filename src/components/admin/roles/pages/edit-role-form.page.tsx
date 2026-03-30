import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { EditRoleForm } from '../components/edit-role-form'

interface RoleFormPageProps {
    roleId: string
}

export const EditRoleFormPage = ({ roleId }: RoleFormPageProps) => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{t('page.edit_title')}</h1>
                <Button variant="outline" onClick={() => navigate({ to: '/admin/roles' })}>
                    {t('actions.back_to_list')}
                </Button>
            </div>

            <EditRoleForm
                roleId={roleId}
                onCancel={() => navigate({ to: '/admin/roles' })}
                onSuccess={() => navigate({ to: '/admin/roles' })}
            />
        </div>
    )
}

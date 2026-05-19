import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AddRoleForm } from '../components/add-role-form'

interface AddRoleFormPageProps {
    basePath?: string
    scope?: 'system' | 'company'
}

export const AddRoleFormPage = ({ basePath = '/admin/roles', scope = 'system' }: AddRoleFormPageProps) => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{t('page.add_title')}</h1>
                <Button variant="outline" onClick={() => navigate({ to: basePath })}>
                    {t('actions.back_to_list')}
                </Button>
            </div>

            <AddRoleForm
                scope={scope}
                onCancel={() => navigate({ to: basePath })}
                onSuccess={() => navigate({ to: basePath })}
            />
        </div>
    )
}

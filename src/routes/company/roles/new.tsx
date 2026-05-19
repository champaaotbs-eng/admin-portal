import { createFileRoute } from '@tanstack/react-router'
import { CompanyAddRolePage } from '@/components/company/roles/add-role-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

const CompanyAddRoleRoutePage = () => {
    return (
        <ProtectedRoute moduleName={COMPANY_MODULES.ROLE}>
            <CompanyAddRolePage />
        </ProtectedRoute>
    )
}

export const Route = createFileRoute('/company/roles/new')({
    component: CompanyAddRoleRoutePage,
})

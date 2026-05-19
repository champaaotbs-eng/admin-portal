import { createFileRoute } from '@tanstack/react-router'
import { CompanyEditRolePage } from '@/components/company/roles/edit-role-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

const CompanyEditRoleRoutePage = () => {
    const { id } = Route.useParams()
    return (
        <ProtectedRoute moduleName={COMPANY_MODULES.ROLE}>
            <CompanyEditRolePage roleId={id} />
        </ProtectedRoute>
    )
}

export const Route = createFileRoute('/company/roles/$id')({
    component: CompanyEditRoleRoutePage,
})

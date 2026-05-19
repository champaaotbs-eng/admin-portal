import { createFileRoute } from '@tanstack/react-router'
import { CompanyRolesPage } from '@/components/company/roles/roles-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

const CompanyRolesRoutePage = () => {
    return (
        <ProtectedRoute moduleName={COMPANY_MODULES.ROLE}>
            <CompanyRolesPage />
        </ProtectedRoute>
    )
}

export const Route = createFileRoute('/company/roles/')({
    component: CompanyRolesRoutePage,
})

import { createFileRoute } from '@tanstack/react-router'

import { CompanyListPage } from 'components/admin/companies/pages/company-list.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const CompaniesRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.COMPANY}>
        <CompanyListPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/companies/')({
    component: CompaniesRoutePage,
})

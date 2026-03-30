import { createFileRoute } from '@tanstack/react-router'

import { CompanyAddPage } from 'components/admin/companies/pages/company-add.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const CompaniesNewRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.COMPANY}>
        <CompanyAddPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/companies/new')({
    component: CompaniesNewRoutePage,
})

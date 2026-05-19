import { createFileRoute } from '@tanstack/react-router'
import { CompanyDashboardPage } from '@/components/company/dashboard/dashboard-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.DASHBOARD}>
            <CompanyDashboardPage />
        </ProtectedRoute>
    ),
})

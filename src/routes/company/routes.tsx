import { createFileRoute } from '@tanstack/react-router'
import { CompanyRoutesPage } from '@/components/company/routes/routes-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/routes')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.ROUTE}>
            <CompanyRoutesPage />
        </ProtectedRoute>
    ),
})

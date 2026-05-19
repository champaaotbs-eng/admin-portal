import { createFileRoute } from '@tanstack/react-router'
import { CompanyRevenuePage } from '@/components/company/revenue/revenue-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/revenue')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.REVENUE}>
            <CompanyRevenuePage />
        </ProtectedRoute>
    ),
})

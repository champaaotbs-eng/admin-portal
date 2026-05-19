import { createFileRoute } from '@tanstack/react-router'
import { CompanyStaffPage } from '@/components/company/staff/staff-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/staff')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.STAFF}>
            <CompanyStaffPage />
        </ProtectedRoute>
    ),
})

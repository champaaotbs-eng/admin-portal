import { createFileRoute } from '@tanstack/react-router'
import { CompanyTripsPage } from '@/components/company/trips/trips-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/trips')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.TRIP}>
            <CompanyTripsPage />
        </ProtectedRoute>
    ),
})

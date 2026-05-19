import { createFileRoute } from '@tanstack/react-router'
import { CompanyFleetPage } from 'components/company/buses/fleet-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/fleet/')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.BUS}>
            <CompanyFleetPage />
        </ProtectedRoute>
    ),
})

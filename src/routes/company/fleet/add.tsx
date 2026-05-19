import { createFileRoute } from '@tanstack/react-router'
import { BusAddPage } from 'components/company/buses/pages/bus-add-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/fleet/add')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.BUS}>
            <BusAddPage />
        </ProtectedRoute>
    ),
})

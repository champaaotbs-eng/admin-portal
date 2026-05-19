import { createFileRoute } from '@tanstack/react-router'
import { CompanySeatLayoutsPage } from 'components/company/seat-layouts/seat-layouts-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/seat-layouts/')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.SEAT_LAYOUT}>
            <CompanySeatLayoutsPage />
        </ProtectedRoute>
    ),
})

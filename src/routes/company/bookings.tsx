import { createFileRoute } from '@tanstack/react-router'
import { CompanyBookingsPage } from '@/components/company/bookings/bookings-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

export const Route = createFileRoute('/company/bookings')({
    component: () => (
        <ProtectedRoute moduleName={COMPANY_MODULES.BOOKING}>
            <CompanyBookingsPage />
        </ProtectedRoute>
    ),
})

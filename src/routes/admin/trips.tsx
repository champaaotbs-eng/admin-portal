import { createFileRoute } from '@tanstack/react-router'
import { AdminTripsPage } from '@/components/admin/trips/trips-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

export const Route = createFileRoute('/admin/trips')({
    component: () => (
        <ProtectedRoute moduleName={ADMIN_MODULES.TRIP}>
            <AdminTripsPage />
        </ProtectedRoute>
    ),
})

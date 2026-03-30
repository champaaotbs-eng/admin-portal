import { createFileRoute } from '@tanstack/react-router'
import { AdminBookingsPage } from '@/components/admin/bookings/bookings-page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const BookingsRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.BOOKING}>
        <AdminBookingsPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/bookings')({ component: BookingsRoutePage })

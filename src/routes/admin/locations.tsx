import { createFileRoute } from '@tanstack/react-router'
import { AdminLocationsPage } from '@/components/admin/locations/locations-page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const LocationsRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.LOCATION}>
        <AdminLocationsPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/locations')({ component: LocationsRoutePage })

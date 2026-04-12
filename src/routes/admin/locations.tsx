import { createFileRoute } from '@tanstack/react-router'
import StationsPage from 'components/admin/stations/stations.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const StationsRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.LOCATION}>
        <StationsPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/locations')({ component: StationsRoutePage })

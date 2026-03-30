import { createFileRoute } from '@tanstack/react-router'
import { AdminRoutesPage } from '@/components/admin/routes/routes-page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const RoutesRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.ROUTE}>
        <AdminRoutesPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/routes')({ component: RoutesRoutePage })

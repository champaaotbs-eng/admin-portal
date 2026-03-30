import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboardPage } from '@/components/admin/dashboard/dashboard-page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const DashboardRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.DASHBOARD}>
        <AdminDashboardPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/')({ component: DashboardRoutePage })

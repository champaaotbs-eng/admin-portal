import { createFileRoute } from '@tanstack/react-router'
import { AdminReportsPage } from '@/components/admin/reports/reports-page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const ReportsRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.REPORT}>
        <AdminReportsPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/reports')({ component: ReportsRoutePage })

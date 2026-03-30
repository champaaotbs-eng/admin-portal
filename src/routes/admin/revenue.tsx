import { createFileRoute } from '@tanstack/react-router'
import { AdminRevenuePage } from '@/components/admin/revenue/revenue-page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const RevenueRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.REVENUE}>
        <AdminRevenuePage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/revenue')({ component: RevenueRoutePage })

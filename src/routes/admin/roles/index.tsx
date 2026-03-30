import { createFileRoute } from '@tanstack/react-router'
import { AdminRolesPage } from '@/components/admin/roles/roles-page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const RolesRoutePage = () => (
    <ProtectedRoute moduleName={ADMIN_MODULES.ROLE}>
        <AdminRolesPage />
    </ProtectedRoute>
)

export const Route = createFileRoute('/admin/roles/')({ component: RolesRoutePage })

import { createFileRoute } from '@tanstack/react-router'
import { AdminListPage } from 'components/admin/admins/pages/admin-list.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const AdminRoutePage = () => (
  <ProtectedRoute moduleName={ADMIN_MODULES.ADMIN}>
    <AdminListPage />
  </ProtectedRoute>
)

export const Route = createFileRoute('/admin/admins/')({
  component: AdminRoutePage,
})

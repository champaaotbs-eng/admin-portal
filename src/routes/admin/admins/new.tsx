import { createFileRoute } from '@tanstack/react-router'
import { AdminAddPage } from 'components/admin/admins/pages/admin-add.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const AdminAddRoutePage = () => {
  return (
    <ProtectedRoute moduleName={ADMIN_MODULES.ADMIN}>
      <AdminAddPage />
    </ProtectedRoute>
  )
}

export const Route = createFileRoute('/admin/admins/new')({
  component: AdminAddRoutePage,
})

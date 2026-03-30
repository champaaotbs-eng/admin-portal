import { createFileRoute } from '@tanstack/react-router'
import { AdminEditPage } from 'components/admin/admins/pages/admin-edit.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const AdminEditRoutePage = () => {
  const { id } = Route.useParams()

  return (
    <ProtectedRoute moduleName={ADMIN_MODULES.ADMIN}>
      <AdminEditPage adminId={id} />
    </ProtectedRoute>
  )
}

export const Route = createFileRoute('/admin/admins/$id')({
  component: AdminEditRoutePage,
})

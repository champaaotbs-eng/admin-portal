import { createFileRoute } from '@tanstack/react-router'
import { AddRoleFormPage } from 'components/admin/roles/pages/add-role-form.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const AddRoleRoutePage = () => (
  <ProtectedRoute moduleName={ADMIN_MODULES.ROLE}>
    <AddRoleFormPage />
  </ProtectedRoute>
)

export const Route = createFileRoute('/admin/roles/new')({ component: AddRoleRoutePage })

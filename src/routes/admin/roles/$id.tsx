import { createFileRoute } from '@tanstack/react-router'
import { EditRoleFormPage } from 'components/admin/roles/pages/edit-role-form.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const EditRoleRoutePage = () => {
    const { id } = Route.useParams()

    return (
        <ProtectedRoute moduleName={ADMIN_MODULES.ROLE}>
            <EditRoleFormPage roleId={id} />
        </ProtectedRoute>
    )
}

export const Route = createFileRoute('/admin/roles/$id')({
    component: EditRoleRoutePage,
})

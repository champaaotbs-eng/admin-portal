import { createFileRoute } from '@tanstack/react-router'
import { CompanyEditRolePage } from '@/components/company/roles/edit-role-page'

const CompanyEditRoleRoutePage = () => {
    const { id } = Route.useParams()
    return <CompanyEditRolePage roleId={id} />
}

export const Route = createFileRoute('/company/roles/$id')({
    component: CompanyEditRoleRoutePage,
})

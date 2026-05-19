import { createFileRoute } from '@tanstack/react-router'
import { CompanyAddRolePage } from '@/components/company/roles/add-role-page'

const CompanyAddRoleRoutePage = () => {
    return <CompanyAddRolePage />
}

export const Route = createFileRoute('/company/roles/new')({
    component: CompanyAddRoleRoutePage,
})

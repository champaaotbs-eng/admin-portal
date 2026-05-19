import { createFileRoute } from '@tanstack/react-router'
import { CompanyRolesPage } from '@/components/company/roles/roles-page'

const CompanyRolesRoutePage = () => {
    return <CompanyRolesPage />
}

export const Route = createFileRoute('/company/roles/')({
    component: CompanyRolesRoutePage,
})

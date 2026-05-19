import { EditRoleFormPage } from '@/components/admin/roles/pages/edit-role-form.page'

interface CompanyEditRolePageProps {
    roleId: string
}

export const CompanyEditRolePage = ({ roleId }: CompanyEditRolePageProps) => {
    return <EditRoleFormPage roleId={roleId} basePath="/company/roles" scope="company" />
}

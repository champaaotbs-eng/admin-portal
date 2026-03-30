import { createFileRoute } from '@tanstack/react-router'

import { CompanyEditPage } from 'components/admin/companies/pages/company-edit.page'
import { ProtectedRoute } from 'components/shared/protected-guard'
import { ADMIN_MODULES } from 'configs/constants'

const CompaniesEditRoutePage = () => {
  const { id } = Route.useParams()

  return (
    <ProtectedRoute moduleName={ADMIN_MODULES.COMPANY}>
      <CompanyEditPage companyId={id} />
    </ProtectedRoute>
  )
}

export const Route = createFileRoute('/admin/companies/$id')({
  component: CompaniesEditRoutePage,
})

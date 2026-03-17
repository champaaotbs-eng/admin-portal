import { createFileRoute } from '@tanstack/react-router'
import { AdminCompaniesPage } from '@/components/admin/companies/companies-page'

export const Route = createFileRoute('/admin/companies')({ component: AdminCompaniesPage })

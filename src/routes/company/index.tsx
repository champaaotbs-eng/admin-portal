import { createFileRoute } from '@tanstack/react-router'
import { CompanyDashboardPage } from '@/components/company/dashboard/dashboard-page'

export const Route = createFileRoute('/company/')({ component: CompanyDashboardPage })

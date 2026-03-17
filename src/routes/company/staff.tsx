import { createFileRoute } from '@tanstack/react-router'
import { CompanyStaffPage } from '@/components/company/staff/staff-page'

export const Route = createFileRoute('/company/staff')({ component: CompanyStaffPage })

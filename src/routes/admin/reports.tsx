import { createFileRoute } from '@tanstack/react-router'
import { AdminReportsPage } from '@/components/admin/reports/reports-page'

export const Route = createFileRoute('/admin/reports')({ component: AdminReportsPage })

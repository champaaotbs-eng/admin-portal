import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboardPage } from '@/components/admin/dashboard/dashboard-page'

export const Route = createFileRoute('/admin/')({ component: AdminDashboardPage })

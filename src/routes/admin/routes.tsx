import { createFileRoute } from '@tanstack/react-router'
import { AdminRoutesPage } from '@/components/admin/routes/routes-page'

export const Route = createFileRoute('/admin/routes')({ component: AdminRoutesPage })

import { createFileRoute } from '@tanstack/react-router'
import { AdminRolesPage } from '@/components/admin/roles/roles-page'

export const Route = createFileRoute('/admin/roles')({ component: AdminRolesPage })

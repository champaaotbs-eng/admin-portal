import { createFileRoute } from '@tanstack/react-router'
import { AdminLocationsPage } from '@/components/admin/locations/locations-page'

export const Route = createFileRoute('/admin/locations')({ component: AdminLocationsPage })

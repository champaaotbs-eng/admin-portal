import { createFileRoute } from '@tanstack/react-router'
import { AdminTripsPage } from '@/components/admin/trips/trips-page'

export const Route = createFileRoute('/admin/trips')({ component: AdminTripsPage })

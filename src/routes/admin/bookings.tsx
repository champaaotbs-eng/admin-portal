import { createFileRoute } from '@tanstack/react-router'
import { AdminBookingsPage } from '@/components/admin/bookings/bookings-page'

export const Route = createFileRoute('/admin/bookings')({ component: AdminBookingsPage })

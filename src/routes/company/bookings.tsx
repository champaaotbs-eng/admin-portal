import { createFileRoute } from '@tanstack/react-router'
import { CompanyBookingsPage } from '@/components/company/bookings/bookings-page'

export const Route = createFileRoute('/company/bookings')({ component: CompanyBookingsPage })

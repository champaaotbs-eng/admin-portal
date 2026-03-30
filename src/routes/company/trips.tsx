import { createFileRoute } from '@tanstack/react-router'
import { CompanyTripsPage } from '@/components/company/trips/trips-page'

export const Route = createFileRoute('/company/trips')({ component: CompanyTripsPage })

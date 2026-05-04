import { createFileRoute } from '@tanstack/react-router'
import { CompanyFleetPage } from 'components/company/buses/fleet-page'

export const Route = createFileRoute('/company/fleet/')({
  component: CompanyFleetPage,
})

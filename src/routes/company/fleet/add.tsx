import { createFileRoute } from '@tanstack/react-router'
import { BusAddPage } from 'components/company/buses/pages/bus-add-page'

export const Route = createFileRoute('/company/fleet/add')({
    component: BusAddPage,
})

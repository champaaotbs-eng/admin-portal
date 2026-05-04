import { createFileRoute } from '@tanstack/react-router'
import { BusEditPage } from 'components/company/buses/pages/bus-edit-page'

import { useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/company/fleet/edit/$busId')({
    component: () => {
        const { busId } = useParams({ from: '/company/fleet/edit/$busId' })
        return <BusEditPage busId={busId} />
    },
})
import { createFileRoute } from '@tanstack/react-router'
import { BusEditPage } from 'components/company/buses/pages/bus-edit-page'
import { ProtectedRoute } from '@/components/shared/protected-guard'
import { COMPANY_MODULES } from 'configs/constants'

import { useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/company/fleet/edit/$busId')({
    component: () => {
        const { busId } = useParams({ from: '/company/fleet/edit/$busId' })
        return (
            <ProtectedRoute moduleName={COMPANY_MODULES.BUS}>
                <BusEditPage busId={busId} />
            </ProtectedRoute>
        )
    },
})

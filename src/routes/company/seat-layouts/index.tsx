import { createFileRoute } from '@tanstack/react-router'
import { CompanySeatLayoutsPage } from 'components/company/seat-layouts/seat-layouts-page'

export const Route = createFileRoute('/company/seat-layouts/')({
    component: CompanySeatLayoutsPage,
})

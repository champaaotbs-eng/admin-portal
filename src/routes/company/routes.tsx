import { createFileRoute } from '@tanstack/react-router'
import { CompanyRoutesPage } from '@/components/company/routes/routes-page'

export const Route = createFileRoute('/company/routes')({ component: CompanyRoutesPage })

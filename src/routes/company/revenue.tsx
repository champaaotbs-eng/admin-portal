import { createFileRoute } from '@tanstack/react-router'
import { CompanyRevenuePage } from '@/components/company/revenue/revenue-page'

export const Route = createFileRoute('/company/revenue')({ component: CompanyRevenuePage })

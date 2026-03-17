import { createFileRoute } from '@tanstack/react-router'
import { AdminRevenuePage } from '@/components/admin/revenue/revenue-page'

export const Route = createFileRoute('/admin/revenue')({ component: AdminRevenuePage })

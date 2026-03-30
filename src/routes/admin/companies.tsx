import { Outlet, createFileRoute } from '@tanstack/react-router'

const CompaniesRoutePage = () => <Outlet />

export const Route = createFileRoute('/admin/companies')({ component: CompaniesRoutePage })

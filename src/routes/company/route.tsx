import { createFileRoute, redirect } from '@tanstack/react-router'
import { CompanyLayout } from 'components/layouts/company-layout'
import { authStore } from '@/store/auth.store'
import { APP_ROUTES } from '@/constants/app-routes'

export const Route = createFileRoute('/company')({
    beforeLoad: () => {
        if (typeof window === 'undefined') return
        const { admin } = authStore.state
        if (!admin || admin.role?.type !== 'company_admin') {
            throw redirect({ to: APP_ROUTES.LOGIN })
        }
    },
    component: CompanyLayout,
})

import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/components/auth/login/login-page'
import { authStore } from '@/store/auth.store'
import { APP_ROUTES } from '@/constants/app-routes'

export const Route = createFileRoute('/auth/login')({
    beforeLoad: () => {
        const { isAuthenticated, admin } = authStore.state

        // If already authenticated, redirect to role home.
        if (isAuthenticated && admin) {
            if (admin.role?.type === 'system_admin') {
                throw redirect({ to: APP_ROUTES.ADMIN.ROOT })
            }

            if (admin.role?.type === 'company_admin') {
                throw redirect({ to: APP_ROUTES.COMPANY.ROOT })
            }
        }
    },
    component: LoginPage,
})

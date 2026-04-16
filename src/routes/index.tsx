import { createFileRoute, redirect } from '@tanstack/react-router'
import { APP_ROUTES } from '@/constants/app-routes'
import { authStore } from '@/store/auth.store'

export const Route = createFileRoute('/')({
    beforeLoad: () => {
        const { isAuthenticated, admin } = authStore.state

        // If authenticated, redirect to role home.
        if (isAuthenticated && admin) {
            if (admin.role?.type === 'system_admin') {
                throw redirect({ to: APP_ROUTES.ADMIN.ROOT })
            }

            if (admin.role?.type === 'company_admin') {
                throw redirect({ to: APP_ROUTES.COMPANY.ROOT })
            }
        }

        // Otherwise redirect to login
        throw redirect({ to: APP_ROUTES.LOGIN })
    },
    component: () => null,
})


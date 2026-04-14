import { createFileRoute, redirect } from '@tanstack/react-router'
import { APP_ROUTES } from '@/constants/app-routes'
import { authStore } from '@/store/auth.store'

export const Route = createFileRoute('/')({
    beforeLoad: () => {
        const { isAuthenticated, admin } = authStore.state

        // If authenticated, redirect to admin dashboard
        if (isAuthenticated && admin) {
            throw redirect({ to: '/admin' })
        }

        // Otherwise redirect to login
        throw redirect({ to: APP_ROUTES.LOGIN })
    },
    component: () => null,
})


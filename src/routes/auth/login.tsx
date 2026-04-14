import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/components/auth/login/login-page'
import { authStore } from '@/store/auth.store'

export const Route = createFileRoute('/auth/login')({
    beforeLoad: () => {
        const { isAuthenticated, admin } = authStore.state

        // If already authenticated, redirect to admin dashboard
        if (isAuthenticated && admin) {
            throw redirect({ to: '/admin' })
        }
    },
    component: LoginPage,
})

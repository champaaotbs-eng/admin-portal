import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { authStore } from '@/store/auth.store'
import { APP_ROUTES } from '@/constants/app-routes'

export const Route = createFileRoute('/admin')({
    beforeLoad: () => {
        if (typeof window === 'undefined') return
        const { admin } = authStore.state
        if (!admin) {
            throw redirect({ to: APP_ROUTES.LOGIN })
        }
    },
    component: AdminLayout,
})

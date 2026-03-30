import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from 'components/layouts/admin-layout'
import { authStore } from '@/store/auth.store'
import { APP_ROUTES } from '@/constants/app-routes'

export const Route = createFileRoute('/admin')({
    beforeLoad: ({ location }) => {
        if (typeof window === 'undefined') return
        const { admin } = authStore.state
        if (!admin) {
            throw redirect({ to: APP_ROUTES.LOGIN })
        }

        // if (!canAccessAdminPath(admin, location.pathname)) {
        //     throw redirect({ to: APP_ROUTES.FORBIDDEN })
        // }
    },
    component: AdminLayout,
})

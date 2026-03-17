import { createFileRoute, redirect } from '@tanstack/react-router'
import { APP_ROUTES } from '@/constants/app-routes'

export const Route = createFileRoute('/')({
    beforeLoad: () => {
        throw redirect({ to: APP_ROUTES.LOGIN })
    },
    component: () => null,
})


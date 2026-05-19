import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { usePermission } from '@/hooks/use-permission'
import { useAuthStore } from '@/store/auth.store'
import { APP_ROUTES } from '@/constants/app-routes'

interface ProtectedRouteProps {
    moduleName: string
    children: ReactNode
}

export const ProtectedRoute = ({ moduleName, children }: ProtectedRouteProps) => {
    const { admin, isAuthenticated } = useAuthStore()
    const { hasReadAccess } = usePermission()

    if (!isAuthenticated || !admin) {
        return <Navigate to={APP_ROUTES.LOGIN} />
    }

    if (!hasReadAccess(moduleName)) {
        return <Navigate to={APP_ROUTES.FORBIDDEN} />
    }

    return <>{children}</>
}

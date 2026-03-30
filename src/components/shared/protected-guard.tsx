import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { usePermission } from '@/hooks/use-permission'

interface ProtectedRouteProps {
    moduleName: string
    children: ReactNode
}

export const ProtectedRoute = ({ moduleName, children }: ProtectedRouteProps) => {
    const { hasReadAccess } = usePermission()

    if (!hasReadAccess(moduleName)) {
        return <Navigate to="/403" />
    }

    return <>{children}</>
}

import React from 'react'
import { usePermission } from '@/hooks/use-permission'

interface PermissionGuardProps {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path: string
    children: React.ReactElement
}

export const PermissionGuard = ({ method, path, children }: PermissionGuardProps) => {
    const { hasWriteAccess } = usePermission()
    const allowed = hasWriteAccess(method,)

    if (allowed) {
        return children
    }

    return React.cloneElement(children, {
        ...children.props,
        disabled: true,
        title: "You don't have permission to perform this action",
        'aria-disabled': true,
    })
}

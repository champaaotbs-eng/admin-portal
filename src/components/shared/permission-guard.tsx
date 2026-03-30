import React from 'react'
import { useTranslation } from 'react-i18next'
import { usePermission } from '@/hooks/use-permission'

interface PermissionGuardProps {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path: string
    children: React.ReactElement
}

export const PermissionGuard = ({ method, path, children }: PermissionGuardProps) => {
    const { t } = useTranslation()
    const { hasWriteAccess } = usePermission()
    const allowed = hasWriteAccess(method,)

    if (allowed) {
        return children
    }

    return React.cloneElement(children, {
        ...children.props,
        disabled: true,
        title: t('common.unauthorized_message'),
        'aria-disabled': true,
    })
}

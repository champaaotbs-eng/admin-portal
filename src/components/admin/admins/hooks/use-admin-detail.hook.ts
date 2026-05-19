import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { IAdmin } from 'types/admin'
import { getAdminById } from 'services/admins/admin.service'
import { getPermissionModulesByRoleType } from 'components/admin/roles/constants/permission.constant'
import { ADMIN_QUERY_KEYS } from '../constants/admin-query-keys.constant'

interface MappedPermission {
    module: string
    label: string
    hasWrite: boolean
    read: boolean
    write: boolean
}

/**
 * Fetch admin detail and map role permissions for display.
 */
export const useAdminDetail = (adminId: string | null) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })

    const { data: admin, isLoading, isError } = useQuery({
        queryKey: ADMIN_QUERY_KEYS.detail(adminId ?? ''),
        queryFn: async () => {
            const response = await getAdminById(adminId as string)
            return response.data
        },
        enabled: Boolean(adminId),
    })

    const mappedPermissions = useMemo<MappedPermission[]>(() => {
        if (!admin?.role) return []

        return getPermissionModulesByRoleType(admin.role.type).map((moduleConfig) => {
            const found = admin.role?.permissions?.find((permission) => permission.module === moduleConfig.module)

            return {
                module: moduleConfig.module,
                label: t(`modules.${moduleConfig.module}`),
                hasWrite: moduleConfig.hasWrite,
                read: found?.read ?? false,
                write: found?.write ?? false,
            }
        })
    }, [admin, t])

    return {
        admin: admin as IAdmin | undefined,
        mappedPermissions,
        isLoading,
        isError,
    }
}

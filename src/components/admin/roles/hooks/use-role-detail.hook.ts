import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { deleteRole, getRoleById } from 'services/admins/roles.service'
import { ROLE_QUERY_KEYS } from '../constants/role-query-keys.constant'
import { PERMISSION_MODULES } from '../constants/permission.constant'

const toErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message?: unknown }).message
        if (typeof message === 'string') return message
    }

    return fallbackMessage
}

/**
 * Role detail data and mutation hook.
 */
export const useRoleDetail = (roleId: string) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })
    const queryClient = useQueryClient()

    const {
        data: role,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ROLE_QUERY_KEYS.detail(roleId),
        queryFn: () => getRoleById(roleId),
        select: (response) => response.data,
        enabled: Boolean(roleId),
    })

    const mappedPermissions = useMemo(() => {
        if (!role) return []

        return PERMISSION_MODULES.map((moduleConfig) => {
            const found = role.permissions?.find((permission) => permission.module === moduleConfig.module)

            return {
                ...moduleConfig,
                read: found?.read ?? false,
                write: found?.write ?? false,
            }
        })
    }, [role])

    const deleteMutation = useMutation({
        mutationFn: () => deleteRole(roleId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.all })
        },
    })

    return {
        role,
        mappedPermissions,
        isLoading,
        isError,
        deleteRoleById: async () => {
            try {
                await deleteMutation.mutateAsync()
                return { success: true as const }
            } catch (error) {
                return {
                    success: false as const,
                    message: toErrorMessage(error, t('messages.action_failed')),
                }
            }
        },
        isDeleting: deleteMutation.isPending,
    }
}

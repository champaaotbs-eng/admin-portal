import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { deleteRole, getAllRoles } from 'services/admins/roles.service'
import { ROLE_QUERY_KEYS } from '../constants/role-query-keys.constant'

type StatusFilter = 'all' | 'active' | 'inactive'

interface UseRoleListParams {
    page: number
    limit?: number
    searchText: string
    statusFilter: StatusFilter
}

const toErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message?: unknown }).message
        if (typeof message === 'string') return message
    }

    return fallbackMessage
}

/**
 * Role list data and mutation hook.
 */
export const useRoleList = ({ page, limit = 10, searchText, statusFilter }: UseRoleListParams) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })
    const queryClient = useQueryClient()
    const normalizedSearchText = searchText.trim()

    const { data, isLoading, isError } = useQuery({
        queryKey: ROLE_QUERY_KEYS.list(page, limit, normalizedSearchText, statusFilter),
        queryFn: () =>
            getAllRoles({
                page,
                limit,
                filters: {
                    roleName: normalizedSearchText,
                    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
                },
            }),
        select: (response) => ({
            roles: response.data?.result ?? [],
            meta: response.data?.meta ?? { page: 1, limit, totalPages: 1, totalItems: 0 },
        }),
    })
    const roles = data?.roles ?? []
    const meta = data?.meta ?? { page: 1, limit, totalPages: 1, totalItems: 0 }

    const deleteMutation = useMutation({
        mutationFn: (roleId: string) => deleteRole(roleId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.all })
        },
    })

    return {
        roles,
        page,
        limit: meta.limit,
        totalPages: meta.totalPages,
        totalItems: meta.totalItems,
        isLoading,
        isError,
        deleteRoleById: async (roleId: string) => {
            try {
                await deleteMutation.mutateAsync(roleId)
                return { success: true as const }
            } catch (error) {
                return {
                    success: false as const,
                    message: toErrorMessage(error, t('messages.delete_failed')),
                }
            }
        },
        isDeleting: deleteMutation.isPending,
    }
}

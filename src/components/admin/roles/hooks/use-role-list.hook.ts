import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { deleteRole, getAllRoles } from 'services/admins/roles.service'
import { getAllAdminBusCompanies } from 'services/admins/bus-company.service'
import { ROLE_QUERY_KEYS } from '../constants/role-query-keys.constant'

type StatusFilter = 'all' | 'active' | 'inactive'

interface UseRoleListParams {
    page: number
    limit?: number
    searchText: string
    statusFilter: StatusFilter
    scope?: 'system' | 'company'
    companyId?: string
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
export const useRoleList = ({ page, limit = 10, searchText, statusFilter, scope = 'system', companyId }: UseRoleListParams) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })
    const queryClient = useQueryClient()
    const normalizedSearchText = searchText.trim()
    const normalizedCompanyId = scope === 'system' ? companyId?.trim() ?? '' : ''

    const { data, isLoading, isError } = useQuery({
        queryKey: ROLE_QUERY_KEYS.list(page, limit, normalizedSearchText, statusFilter, scope, normalizedCompanyId || undefined),
        queryFn: () =>
            getAllRoles({
                page,
                limit,
                filters: {
                    name: normalizedSearchText,
                    ...(scope === 'company' ? { type: 'company_admin' } : {}),
                    ...(normalizedCompanyId ? { companyId: normalizedCompanyId } : {}),
                    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
                },
            }),
        select: (response) => ({
            roles: response.data?.result ?? [],
            meta: response.data?.meta ?? { page: 1, limit, totalPages: 1, totalItems: 0 },
        }),
    })
    const companiesQuery = useQuery({
        queryKey: ['role-company-options'],
        queryFn: () => getAllAdminBusCompanies(),
        select: (response) => response.data ?? [],
        enabled: scope === 'system',
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
        isLoading: isLoading || companiesQuery.isLoading,
        isError,
        companies: companiesQuery.data ?? [],
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

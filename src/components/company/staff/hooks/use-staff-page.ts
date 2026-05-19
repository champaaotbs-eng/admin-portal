import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { IAdmin } from 'types/admin'
import type { IRole } from 'types/role'
import { getCompanyRoles } from 'services/admins/roles.service'
import { createCompanyStaff, deleteCompanyStaff, getCompanyStaff, updateCompanyStaff } from 'services/company/staff.service'
import type { StaffFormData } from '../validation-schema'

const STAFF_QUERY_KEY = ['company-staff']
const STAFF_STATS_QUERY_KEY = ['company-staff-stats']
const COMPANY_ROLE_QUERY_KEY = ['company-role-options']

interface UseStaffPageProps {
    search: string
    roleFilter: string
    page: number
    pageSize: number
}

const resolveErrorMessage = (error: unknown, fallback: string) => {
    const source = error as { localizedMessage?: string; message?: string; response?: { data?: { message?: string } } }
    return source.localizedMessage ?? source.message ?? source.response?.data?.message ?? fallback
}

export const useStaffPage = ({ search, roleFilter, page, pageSize }: UseStaffPageProps) => {
    const queryClient = useQueryClient()

    const rolesQuery = useQuery({
        queryKey: COMPANY_ROLE_QUERY_KEY,
        queryFn: () => getCompanyRoles(),
        select: (response) => response.data ?? [],
    })

    const roleOptions = rolesQuery.data ?? []

    const filters = useMemo(() => {
        const normalizedSearch = search.trim()
        return {
            ...(normalizedSearch ? { username: normalizedSearch, fullName: normalizedSearch } : {}),
            ...(roleFilter !== 'all' ? { roleId: roleFilter } : {}),
        }
    }, [roleFilter, search])

    const staffQuery = useQuery({
        queryKey: [...STAFF_QUERY_KEY, page, pageSize, search, roleFilter],
        queryFn: () => getCompanyStaff({
            page,
            limit: pageSize,
            filters,
            sort: [{ orderBy: 'createdAt', order: 'DESC' }],
        }),
    })

    const staffStatsQuery = useQuery({
        queryKey: [...STAFF_STATS_QUERY_KEY],
        queryFn: () => getCompanyStaff({ page: 1, limit: 1000, sort: [{ orderBy: 'createdAt', order: 'DESC' }] }),
    })

    const staff = staffQuery.data?.data?.result ?? []
    const meta = staffQuery.data?.data?.meta
    const statsSource = staffStatsQuery.data?.data?.result ?? []

    const stats = useMemo(() => {
        const byRole = roleOptions.reduce<Record<string, number>>((acc, role) => {
            acc[role.roleId] = statsSource.filter((admin) => admin.role?.roleId === role.roleId).length
            return acc
        }, {})

        return {
            total: staffStatsQuery.data?.data?.meta?.totalItems ?? meta?.totalItems ?? 0,
            active: statsSource.filter((admin) => admin.isActive).length,
            byRole,
        }
    }, [meta?.totalItems, roleOptions, staffStatsQuery.data?.data?.meta?.totalItems, statsSource])

    const createMutation = useMutation({
        mutationFn: (payload: StaffFormData) => createCompanyStaff(payload),
        onSuccess: () => {
            toast.success('Staff created successfully')
            void queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY })
            void queryClient.invalidateQueries({ queryKey: STAFF_STATS_QUERY_KEY })
        },
        onError: (error) => toast.error(resolveErrorMessage(error, 'Failed to create staff')),
    })

    const updateMutation = useMutation({
        mutationFn: ({ adminId, payload }: { adminId: string; payload: Partial<StaffFormData> }) => updateCompanyStaff(adminId, payload),
        onSuccess: () => {
            toast.success('Staff updated successfully')
            void queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY })
            void queryClient.invalidateQueries({ queryKey: STAFF_STATS_QUERY_KEY })
        },
        onError: (error) => toast.error(resolveErrorMessage(error, 'Failed to update staff')),
    })

    const deleteMutation = useMutation({
        mutationFn: (adminId: string) => deleteCompanyStaff(adminId),
        onSuccess: () => {
            toast.success('Staff deactivated successfully')
            void queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY })
            void queryClient.invalidateQueries({ queryKey: STAFF_STATS_QUERY_KEY })
        },
        onError: (error) => toast.error(resolveErrorMessage(error, 'Failed to deactivate staff')),
    })

    const submitStaff = async (selected: IAdmin | null, values: StaffFormData) => {
        if (selected?.adminId) {
            const payload: Partial<StaffFormData> = {
                username: values.username,
                fullName: values.fullName,
                roleId: values.roleId,
                isActive: values.isActive,
            }
            if (values.password?.trim()) {
                payload.password = values.password.trim()
            }
            await updateMutation.mutateAsync({ adminId: selected.adminId, payload })
            return
        }

        await createMutation.mutateAsync({
            username: values.username.trim(),
            fullName: values.fullName.trim(),
            roleId: values.roleId,
            password: values.password?.trim(),
            isActive: values.isActive,
        })
    }

    const removeStaff = async (selected: IAdmin) => {
        await deleteMutation.mutateAsync(selected.adminId)
    }

    return {
        staff,
        meta,
        stats,
        roles: roleOptions as IRole[],
        isLoading: staffQuery.isLoading,
        isLoadingRoles: rolesQuery.isLoading,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        isRemoving: deleteMutation.isPending,
        submitStaff,
        removeStaff,
    }
}
